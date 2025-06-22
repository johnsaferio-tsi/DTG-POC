// src/routes/queue.routes.ts
import { Router, Request, Response } from "express"
import { publishBatch } from "../services/rabbitmq.service"
import axios from "axios"

const queueRouter = Router()

export type ColumnType =
  | "INTEGER"
  | "FLOAT"
  | "BOOLEAN"
  | "DATE"
  | "TIMESTAMP"
  | "JSONB"
  | "TEXT"
  | "TEXT[]"

export interface FieldDefinition {
  type: ColumnType
  isPrimary?: boolean
  isForeign?: boolean
  references?: {
    table: string
    column: string
  }
}

interface UploadCsvRequestBody {
  csvName: string
  fields: Record<string, FieldDefinition>
  rows: string[][]
}

queueRouter.post(
  "/table-queue",
  async (req: Request<{}, {}, UploadCsvRequestBody>, res: Response) => {
    try {
      const { csvName, fields, rows } = req.body

      const BATCH_SIZE = 50
      const notificationKey = `${csvName}-${Date.now()}`
      await axios.post("http://localhost:3002/api/notifications", {
        message: `Uploading '${csvName}' to server`,
        tableName: csvName,
        notificationKey,
      })
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        publishBatch({
          csvName,
          fields,
          rows: batch,
          batchNumber: Math.floor(i / BATCH_SIZE) + 1,
          isFirstBatch: i === 0, // Pass this
          notificationKey,
        })
      }

      return res.status(200).json({ message: "Batches published to queue" })
    } catch (err) {
      console.error("Publish error", err)
      return res.status(500).json({ error: "Failed to publish to queue" })
    }
  }
)

export default queueRouter
