// src/routes/table.routes.ts

import { Router, Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const router = Router()
const prisma = new PrismaClient()

// 1. Get all dynamic table names
router.get("/", async (req: Request, res: Response) => {
  const tables = await prisma.dataTableDefinition.findMany({
    select: { tableName: true },
  })
  res.json(tables)
})

// 2. Get schema of a specific dynamic table
router.get("/:tableName/schema", async (req: Request, res: Response) => {
  const { tableName } = req.params
  const schema = await prisma.dataTableDefinition.findUnique({
    where: { tableName },
  })

  if (!schema) return res.status(404).json({ error: "Table not found" })
  res.json(schema)
})

// 3. Get rows from a dynamic table (with pagination)
router.get("/:tableName/rows", async (req: Request, res: Response) => {
  const { tableName } = req.params
  const limit = Number(req.query.limit) || 100
  const offset = Number(req.query.offset) || 0

  try {
    // Get primary key field from schema definition
    const schema = await prisma.dataTableDefinition.findUnique({
      where: { tableName },
    })

    if (!schema) {
      return res.status(404).json({ error: "Table not found" })
    }

    const fields = schema.fields as Record<
      string,
      { type: string; isPrimary: boolean }
    >
    const primaryKey =
      Object.entries(fields).find(([, def]) => def.isPrimary)?.[0] ?? null

    // Fetch rows with LIMIT and OFFSET
    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`
    )

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) FROM "${tableName}"`
    )
    const totalCount = Number(countResult[0].count)

    res.json({ rows, primaryKey, totalCount })
  } catch (err) {
    console.error("❌ DB Error:", err)
    res.status(400).json({ error: `Failed to fetch data from '${tableName}'` })
  }
})

// 4. Basic column search
router.get("/:tableName/search", async (req: Request, res: Response) => {
  const { tableName } = req.params
  const { column, value } = req.query as { column?: string; value?: string }

  if (!column || !value) {
    return res.status(400).json({ error: "Missing 'column' or 'value'" })
  }

  try {
    const query = `SELECT * FROM "${tableName}" WHERE "${column}"::text ILIKE '%${value}%'`
    const result = await prisma.$queryRawUnsafe(query)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: "Invalid query" })
  }
})

// 5. Update a row in a dynamic table
router.put(
  "/:tableName/rows/:primaryKeyValue",
  async (req: Request, res: Response) => {
    const { tableName, primaryKeyValue } = req.params
    const updatedData = req.body

    try {
      // Get schema to identify primary key
      const schema = await prisma.dataTableDefinition.findUnique({
        where: { tableName },
      })
      if (!schema) return res.status(404).json({ error: "Table not found" })

      const fields = schema.fields as Record<
        string,
        { type: string; isPrimary: boolean }
      >
      const primaryKey = Object.entries(fields).find(
        ([, def]) => def.isPrimary
      )?.[0]
      if (!primaryKey)
        return res.status(400).json({ error: "Primary key not defined" })

      const setClause = Object.entries(updatedData)
        .map(
          ([key, val]) =>
            `"${key}" = ${
              typeof val === "string" ? `'${val.replace(/'/g, "''")}'` : val
            }`
        )
        .join(", ")

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKey}" = '${primaryKeyValue}'`

      await prisma.$executeRawUnsafe(query)
      console.log(`Row with ${primaryKey}=${primaryKeyValue} updated.`)
      res.json({
        message: `Row with ${primaryKey}=${primaryKeyValue} updated.`,
      })
    } catch (err) {
      console.error("Update error:", err)
      res.status(500).json({ error: "Failed to update row" })
    }
  }
)

// 6. Delete a row from a dynamic table
router.delete(
  "/:tableName/rows/:primaryKeyValue",
  async (req: Request, res: Response) => {
    const { tableName, primaryKeyValue } = req.params

    try {
      const schema = await prisma.dataTableDefinition.findUnique({
        where: { tableName },
      })
      if (!schema) return res.status(404).json({ error: "Table not found" })

      const fields = schema.fields as Record<
        string,
        { type: string; isPrimary: boolean }
      >
      const primaryKey = Object.entries(fields).find(
        ([, def]) => def.isPrimary
      )?.[0]
      if (!primaryKey)
        return res.status(400).json({ error: "Primary key not defined" })

      const query = `DELETE FROM "${tableName}" WHERE "${primaryKey}" = '${primaryKeyValue}'`

      await prisma.$executeRawUnsafe(query)
      res.json({
        message: `Row with ${primaryKey}=${primaryKeyValue} deleted.`,
      })
    } catch (err) {
      console.error("Delete error:", err)
      res.status(500).json({ error: "Failed to delete row" })
    }
  }
)

export default router
