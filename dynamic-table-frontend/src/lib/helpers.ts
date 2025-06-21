export function detectColumnTypes(
  headers: string[],
  rows: string[][]
): Record<string, string> {
  const types: Record<string, string> = {}

  headers.forEach((header, i) => {
    const columnValues = rows
      .map((row) => row[i])
      .filter(Boolean)
      .slice(0, 10)

    const typeCounts = {
      integer: 0,
      float: 0,
      boolean: 0,
      timestamp: 0,
      text: 0,
    }

    columnValues.forEach((value) => {
      const trimmed = value.trim()

      // Integer
      if (/^-?\d+$/.test(trimmed)) {
        typeCounts.integer++
      }
      // Float (but not integer)
      else if (/^-?\d*\.\d+$/.test(trimmed)) {
        typeCounts.float++
      }
      // Boolean
      else if (trimmed === "true" || trimmed === "false") {
        typeCounts.boolean++
      }
      // Date (if not a plain number)
      else if (
        !/^[-+]?\d+(\.\d+)?$/.test(trimmed) &&
        !isNaN(Date.parse(trimmed))
      ) {
        typeCounts.timestamp++
      }
      // Default to text
      else {
        typeCounts.text++
      }
    })

    const mostLikely = Object.entries(typeCounts).sort(
      (a, b) => b[1] - a[1]
    )[0][0]
    types[header] = mostLikely
  })

  return types
}

export function getBadgeClass(type: string) {
  switch (type) {
    case "number":
      return "bg-warning text-dark"
    case "boolean":
      return "bg-success"
    case "date":
      return "bg-primary"
    case "string":
      return "bg-secondary"
    default:
      return "bg-light text-dark"
  }
}
