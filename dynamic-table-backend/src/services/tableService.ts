// src/services/tableService.ts

import { PrismaClient, Prisma } from "@prisma/client"
import {} from "@prisma/client" // Ad
import {
  generateCreateTableSQL,
  generateAlterTableSQL,
  generateInsertSQL,
  FieldDefinition,
  ColumnType,
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
  rows: string[][]
) {
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
        fields: fields as unknown as Prisma.JsonObject,
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
        data: { fields: fields as unknown as Prisma.JsonObject },
      })
    }
  }

  // INSERT DATA
  const insertQuery = generateInsertSQL(tableName, fields, rows)
  await prisma.$executeRawUnsafe(insertQuery)
}
