export function detectColumnTypes(
  headers: string[],
  rows: string[][]
): Record<string, string> {
  const types: Record<string, string> = {}

  const isLikelyTimestamp = (value: string): boolean => {
    // Accept formats like 2024-06-01 or 2024-06-01T12:34:56Z
    return /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/.test(value)
  }

  headers.forEach((header, i) => {
    const columnValues = rows
      .map((row) => row[i])
      .filter(Boolean)
      .slice(0, 10)

    const uniqueValues = new Set(columnValues.map((v) => v.trim()))
    const typeCounts = {
      integer: 0,
      float: 0,
      boolean: 0,
      timestamp: 0,
      text: 0,
    }

    columnValues.forEach((value) => {
      const trimmed = value.trim()

      if (/^-?\d+$/.test(trimmed)) {
        typeCounts.integer++
      } else if (/^-?\d*\.\d+$/.test(trimmed)) {
        typeCounts.float++
      } else if (
        trimmed.toLowerCase() === "true" ||
        trimmed.toLowerCase() === "false"
      ) {
        typeCounts.boolean++
      } else if (isLikelyTimestamp(trimmed)) {
        typeCounts.timestamp++
      } else {
        typeCounts.text++
      }
    })

    // Fallback: if only one unique string, mark as text to avoid timestamp misclassification
    if (typeCounts.timestamp > 0 && typeCounts.text > 0) {
      typeCounts.timestamp = 0 // prefer text if both detected
    }

    if (uniqueValues.size === 1 && typeCounts.text > 0) {
      types[header] = "text"
    } else {
      const mostLikely = Object.entries(typeCounts).sort(
        (a, b) => b[1] - a[1]
      )[0][0]
      types[header] = mostLikely
    }
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
