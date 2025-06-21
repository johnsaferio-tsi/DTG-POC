import type { NextApiRequest, NextApiResponse } from "next"
import { IncomingForm, File } from "formidable"
import fs from "fs/promises"
import { parse } from "csv-parse"
import { detectColumnTypes } from "@/lib/helpers"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const form = new IncomingForm({ keepExtensions: true, multiples: true })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err)
      return res.status(500).json({ message: "File upload failed" })
    }

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file]
    const result: {
      fileName: string
      headers: string[]
      rows: string[][]
      types: Record<string, string>
    }[] = []

    for (const file of uploadedFiles) {
      const f = file as File
      if (!f?.filepath) continue

      try {
        const content = await fs.readFile(f.filepath, "utf-8")

        const parsed = await new Promise<{
          headers: string[]
          rows: string[][]
        }>((resolve, reject) => {
          parse(
            content,
            { delimiter: ",", skip_empty_lines: true },
            (err, output) => {
              if (err) return reject(err)
              const headers = output[0]
              const rows = output.slice(1)
              resolve({ headers, rows })
            }
          )
        })

        const types = detectColumnTypes(parsed.headers, parsed.rows)
        console.log(`types======>`, types)

        result.push({
          fileName: f.originalFilename || "Unnamed.csv",
          headers: parsed.headers,
          rows: parsed.rows,
          types,
        })
      } catch (e) {
        console.error("Error reading file:", f.originalFilename, e)
      }
    }

    console.log(`result======>`, result)

    res.status(200).json({ files: result })
  })
}
