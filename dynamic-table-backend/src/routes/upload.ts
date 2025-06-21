// src/routes/upload.ts
import { Router, Request, Response } from "express"
import { syncDynamicTable } from "../services/tableService"
import { FieldDefinition } from "../utils/sqlUtils"

const router: Router = Router()

interface UploadCsvRequestBody {
  csvName: string
  fields: Record<string, FieldDefinition>
  rows: string[][]
}

router.post(
  "/upload-csv",
  async (req: Request<{}, {}, UploadCsvRequestBody>, res: Response) => {
    try {
      const { csvName, fields, rows } = req.body

      if (!csvName || typeof fields !== "object" || !Array.isArray(rows)) {
        return res.status(400).json({ error: "Invalid payload structure" })
      }

      await syncDynamicTable(csvName, fields, rows)

      console.log(`Table '${csvName}' synced successfully.`)
      return res
        .status(200)
        .json({ message: `Table '${csvName}' synced successfully.` })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Internal Server Error" })
    }
  }
)

export default router
