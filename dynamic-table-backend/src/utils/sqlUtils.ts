// src/utils/sqlUtils.ts

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

export function inferFieldTypes(
  headers: string[],
  rows: string[][]
): Record<string, ColumnType> {
  function isJSON(str: string): boolean {
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === "object"
    } catch {
      return false
    }
  }

  function isDate(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(str)
  }

  function isTimestamp(str: string): boolean {
    return !isNaN(Date.parse(str))
  }

  const types: Record<string, ColumnType> = {}

  headers.forEach((header, i) => {
    const values = rows.map((row) => row[i]).filter(Boolean)

    if (values.every((v) => /^\d+$/.test(v))) {
      types[header] = "INTEGER"
    } else if (values.every((v) => /^-?\d+(\.\d+)?$/.test(v))) {
      types[header] = "FLOAT"
    } else if (values.every((v) => v === "true" || v === "false")) {
      types[header] = "BOOLEAN"
    } else if (values.every(isDate)) {
      types[header] = "DATE"
    } else if (values.every(isTimestamp)) {
      types[header] = "TIMESTAMP"
    } else if (values.every(isJSON)) {
      types[header] = "JSONB"
    } else if (values.every((v) => v.startsWith("{") && v.endsWith("}"))) {
      types[header] = "TEXT[]"
    } else {
      types[header] = "TEXT"
    }
  })

  return types
}

export function generateCreateTableSQL(
  tableName: string,
  fields: Record<string, FieldDefinition>
): string {
  const columnDefinitions = Object.entries(fields).map(([name, def]) => {
    let line = `"${name}" ${def.type}`
    if (def.isPrimary) line += " PRIMARY KEY"
    if (def.isForeign && def.references) {
      line += ` REFERENCES \"${def.references.table}\"(\"${def.references.column}\")`
    }
    return line
  })

  return `CREATE TABLE "${tableName}" (\n  ${columnDefinitions.join(
    ",\n  "
  )}\n);`
}

export function generateAlterTableSQL(
  tableName: string,
  toAdd: Record<string, ColumnType>,
  toRemove: string[]
): string {
  const addStatements = Object.entries(toAdd).map(
    ([field, type]) =>
      `ALTER TABLE "${tableName}" ADD COLUMN "${field}" ${type};`
  )

  const removeStatements = toRemove.map(
    (field) => `ALTER TABLE "${tableName}" DROP COLUMN "${field}";`
  )

  return [...addStatements, ...removeStatements].join("\n")
}

export function generateInsertSQL(
  tableName: string,
  fields: Record<string, FieldDefinition>,
  rows: any[][]
): string {
  const columnNames = Object.keys(fields)
  const primaryKeys = Object.entries(fields)
    .filter(([_, def]) => def.isPrimary)
    .map(([name]) => name)

  const values = rows
    .map(
      (row) =>
        `(${row
          .map((val) =>
            val === null || val === undefined
              ? "NULL"
              : `'${String(val).replace(/'/g, "''")}'`
          )
          .join(", ")})`
    )
    .join(",\n")

  const updateAssignments = columnNames
    .filter((col) => !primaryKeys.includes(col))
    .map((col) => `"${col}" = EXCLUDED."${col}"`)
    .join(", ")

  let query = `INSERT INTO "${tableName}" (${columnNames
    .map((col) => `"${col}"`)
    .join(", ")})\nVALUES\n${values}`

  if (primaryKeys.length > 0) {
    query += `\nON CONFLICT (${primaryKeys
      .map((col) => `"${col}"`)
      .join(", ")})\nDO UPDATE SET ${updateAssignments}`
  }

  return query + ";"
}
