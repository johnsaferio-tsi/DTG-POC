// src/services/tableService.ts

import { PrismaClient, Prisma } from "@prisma/client"
import {} from "@prisma/client" // Ad
import {
  generateCreateTableSQL,
  generateAlterTableSQL,
  generateInsertSQL,
  FieldDefinition,
  ColumnType,
  generateUpsertSQL,
} from "../utils/sqlUtils"

const prisma = new PrismaClient()

export async function logSchemaChange(
  tableName: string,
  action: "CREATE" | "ALTER",
  fields: Record<string, FieldDefinition>,
  query: string
) {
  await prisma.schemaLog.create({
    data: {
      tableName,
      action,
      fields: fields as unknown as Prisma.JsonObject, // ✅ Safe and compiler-compliant
      executedQuery: query,
    },
  })
}

export async function syncDynamicTable(
  tableName: string,
  fields: Record<string, FieldDefinition>,
  rows: string[][],
  isFirstBatch: boolean
) {
  if (isFirstBatch) {
    const existingDefinition = await prisma.dataTableDefinition.findUnique({
      where: { tableName },
    })

    if (!existingDefinition) {
      // CREATE TABLE
      const createQuery = generateCreateTableSQL(tableName, fields)
      await prisma.$executeRawUnsafe(createQuery)

      // Log
      await logSchemaChange(tableName, "CREATE", fields, createQuery)

      await prisma.dataTableDefinition.create({
        data: {
          tableName,
          fields: fields as unknown as any,
        },
      })
    } else {
      const existingFields = existingDefinition.fields as unknown as Record<
        string,
        FieldDefinition
      >

      const toAdd: Record<string, ColumnType> = {}
      const toRemove: string[] = []

      for (const [key, def] of Object.entries(fields)) {
        if (!existingFields[key]) toAdd[key] = def.type
      }
      for (const key of Object.keys(existingFields)) {
        if (!fields[key]) toRemove.push(key)
      }

      if (Object.keys(toAdd).length > 0 || toRemove.length > 0) {
        const alterQuery = generateAlterTableSQL(tableName, toAdd, toRemove)
        await prisma.$executeRawUnsafe(alterQuery)

        await logSchemaChange(tableName, "ALTER", fields, alterQuery)

        await prisma.dataTableDefinition.update({
          where: { tableName },
          data: { fields: fields as unknown as any },
        })
      }
    }
  }

  // INSERT DATA with UPSERT
  const insertQuery = generateUpsertSQL(tableName, fields, rows)

  const maxRetries = 5
  let attempt = 0
  let success = false

  while (!success && attempt < maxRetries) {
    try {
      await prisma.$executeRawUnsafe(insertQuery)
      success = true
    } catch (err: any) {
      if (
        err.code === "P2010" &&
        err.meta?.code === "42P01" &&
        err.meta?.message?.includes("does not exist")
      ) {
        // Wait and retry
        attempt++
        console.warn(
          `⏳ Table "${tableName}" not yet available. Retrying in 500ms (attempt ${attempt}/${maxRetries})...`
        )
        await new Promise((res) => setTimeout(res, 500))
      } else {
        console.error("Failed insert query:", insertQuery)
        console.error("Error:", err)
        throw err
      }
    }
  }

  if (!success) {
    throw new Error(`❌ Insert failed after ${maxRetries} retries.`)
  }
}

export async function createNotification(
  message: string,
  tableName: string,
  notificationKey: string
) {
  return await prisma.notification.create({
    data: {
      message,
      tableName,
      notificationKey,
      status: "PENDING",
      isRead: false,
    },
  })
}

export async function markNotificationAsCreatedByKey(notificationKey: string) {
  console.log(`markNotificationAsCreatedByKey=====>`, notificationKey)
  return await prisma.notification.updateMany({
    where: { notificationKey },
    data: { status: "CREATED" },
  })
}

export async function markNotificationAsRead(id: number) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  })
}

export async function getAllNotifications() {
  return await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function markNotificationAsCreated(id: number) {
  return await prisma.notification.update({
    where: { id },
    data: { status: "CREATED" },
  })
}
