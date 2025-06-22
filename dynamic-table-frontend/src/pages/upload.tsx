import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import Toastify from "toastify-js"
import "toastify-js/src/toastify.css"
import Sidebar from "../Components/Sidebar"

const POSTGRES_TYPES = ["text", "integer", "float", "boolean", "timestamp"]

interface Field {
  name: string
  type: string
  isPrimaryKey: boolean
}

interface FileSchema {
  csvName: string
  fields: Field[]
  rows: string[][]
  isFirstBatch?: boolean
}

export default function UploadPage() {
  const [fileSchemas, setFileSchemas] = useState<FileSchema[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const formData = new FormData()
    acceptedFiles.forEach((file) => {
      if (file.type === "text/csv") {
        formData.append("file", file)
      }
    })

    fetch("/api/readFile", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          const parsed: FileSchema[] = data.files.map((file: any) => ({
            csvName: file.fileName.replace(".csv", ""),
            rows: file.rows,
            fields: file.headers.map((header: string) => ({
              name: header,
              type: file.types[header],
              isPrimaryKey: false,
            })),
          }))
          setFileSchemas(parsed)
        }
      })
      .catch(() => {
        Toastify({
          text: "Upload failed.",
          backgroundColor: "#dc3545",
        }).showToast()
      })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: true,
  })

  const handleFieldChange = (
    fileIndex: number,
    fieldIndex: number,
    key: keyof Field,
    value: any
  ) => {
    const updated = [...fileSchemas]
    if (key === "isPrimaryKey") {
      updated[fileIndex].fields = updated[fileIndex].fields.map(
        (field, idx) => ({
          ...field,
          isPrimaryKey: idx === fieldIndex,
        })
      )
    } else {
      updated[fileIndex].fields[fieldIndex][key] = value
    }
    setFileSchemas(updated)
  }

  const handleTableNameChange = (index: number, name: string) => {
    const updated = [...fileSchemas]
    updated[index].csvName = name
    setFileSchemas(updated)
  }

  const handleGenerateTable = () => {
    fileSchemas.forEach((schema) => {
      const primaryKeys = schema.fields.filter((f) => f.isPrimaryKey)

      if (!schema.csvName.trim()) {
        Toastify({
          text: `Table name is required.`,
          backgroundColor: "#dc3545",
        }).showToast()
        return
      }

      if (!primaryKeys.length) {
        Toastify({
          text: `Select a primary key for table '${schema.csvName}'`,
          backgroundColor: "#ffc107",
        }).showToast()
        return
      }

      const requestBody: any = {
        csvName: schema.csvName,
        fields: schema.fields.reduce((acc, field) => {
          acc[field.name] = {
            type: field.type.toUpperCase(),
            ...(field.isPrimaryKey ? { isPrimary: true } : {}),
          }
          return acc
        }, {} as Record<string, { type: string; isPrimary?: boolean }>),
        rows: schema.rows,
        isFirstBatch: true,
      }

      const isLarge = schema.rows.length > 50
      const targetUrl = isLarge
        ? "http://localhost:3003/api/queue/table-queue"
        : "http://localhost:3002/api/upload-csv"

      console.log(`targetUrl======>`, targetUrl)

      fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
        .then((res) => res.json())
        .then((res) => {
          Toastify({
            text: isLarge
              ? `Since the file is larger, '${schema.csvName}' is being processed via queue. We’ll notify you once the processing is completed.`
              : `Table '${schema.csvName}' created successfully!`,
            backgroundColor: isLarge ? "#17a2b8" : "#28a745",
          }).showToast()

          setFileSchemas([])
        })
        .catch((err) => {
          Toastify({
            text: `Error creating table '${schema.csvName}'`,
            backgroundColor: "#dc3545",
          }).showToast()
          console.error("Error:", err)
        })
    })
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0 bg-light min-vh-100">
          <Sidebar />
        </div>
        <div className="col-md-9 col-lg-10 py-5">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              <h3 className="mb-4 fw-bold text-primary text-center">
                Upload CSV Files
              </h3>

              <div
                {...getRootProps()}
                className={`dropzone p-4 mb-4 border rounded ${
                  isDragActive
                    ? "bg-light border-primary"
                    : "bg-white border-secondary"
                }`}
                style={{ borderStyle: "dashed", cursor: "pointer" }}>
                <input {...getInputProps()} />
                <p className="text-muted mb-0 text-center">
                  <strong>Drag & drop CSV files here</strong> or click to select
                  files
                </p>
              </div>

              {fileSchemas.length > 0 && (
                <div className="accordion mt-4" id="csvAccordion">
                  {fileSchemas.map((file, fileIdx) => (
                    <div
                      className="accordion-item mb-3 shadow-sm"
                      key={fileIdx}>
                      <h2
                        className="accordion-header"
                        id={`heading-${fileIdx}`}>
                        <button
                          className="accordion-button collapsed bg-light"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${fileIdx}`}
                          aria-expanded="false"
                          aria-controls={`collapse-${fileIdx}`}>
                          {file.csvName}
                        </button>
                      </h2>
                      <div
                        id={`collapse-${fileIdx}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${fileIdx}`}
                        data-bs-parent="#csvAccordion">
                        <div className="accordion-body bg-white rounded-bottom">
                          <div className="mb-3 text-start">
                            <label className="form-label fw-semibold">
                              Table Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={file.csvName}
                              onChange={(e) =>
                                handleTableNameChange(fileIdx, e.target.value)
                              }
                            />
                          </div>

                          <table className="table table-striped align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Field Name</th>
                                <th>Data Type</th>
                                <th className="text-center">Primary Key</th>
                              </tr>
                            </thead>
                            <tbody>
                              {file.fields.map((field, fieldIdx) => (
                                <tr key={fieldIdx}>
                                  <td>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={field.name}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          fileIdx,
                                          fieldIdx,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <select
                                      className="form-select"
                                      value={field.type}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          fileIdx,
                                          fieldIdx,
                                          "type",
                                          e.target.value
                                        )
                                      }>
                                      {POSTGRES_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                          {type}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="text-center">
                                    <input
                                      type="checkbox"
                                      checked={field.isPrimaryKey}
                                      onChange={() =>
                                        handleFieldChange(
                                          fileIdx,
                                          fieldIdx,
                                          "isPrimaryKey",
                                          true
                                        )
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-end mt-4">
                    <button
                      className="btn btn-success px-4 py-2"
                      onClick={handleGenerateTable}>
                      Generate Table
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
