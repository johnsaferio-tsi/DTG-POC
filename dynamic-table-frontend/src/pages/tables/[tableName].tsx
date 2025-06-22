import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Sidebar from "../../Components/Sidebar"
import Toastify from "toastify-js"
import "toastify-js/src/toastify.css"

export default function TablePage() {
  const { query } = useRouter()
  const tableName = query.tableName as string
  const [tableData, setTableData] = useState<any[]>([])
  const [editRow, setEditRow] = useState<any | null>(null)
  const [primaryKey, setPrimaryKey] = useState<string | null>(null)
  const [rowToDelete, setRowToDelete] = useState<any | null>(null)
  const [page, setPage] = useState<number>(1)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const LIMIT = 10

  const getTabeleData = async (tableName: string, currentPage = 1) => {
    const offset = (currentPage - 1) * LIMIT
    const res = await fetch(
      `http://localhost:3002/api/tables/${tableName}/rows?limit=${LIMIT}&offset=${offset}`
    )
    const data = await res.json()
    setTableData(data.rows)
    setPrimaryKey(data.primaryKey)
    setTotalRecords(data.totalCount || 0)
  }

  useEffect(() => {
    if (tableName) {
      setPage(1)
      getTabeleData(tableName, 1)
    }
  }, [tableName])

  useEffect(() => {
    if (tableName) getTabeleData(tableName, page)
  }, [page])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalRecords / LIMIT))
      setPage(newPage)
  }

  const handleEditClick = (row: any) => setEditRow(row)

  const confirmDelete = (row: any) => setRowToDelete(row)

  const handleDeleteConfirm = async () => {
    if (!tableName || !primaryKey || !rowToDelete) return
    const primaryKeyValue = rowToDelete[primaryKey]
    try {
      const res = await fetch(
        `http://localhost:3002/api/tables/${tableName}/rows/${primaryKeyValue}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Delete failed")
      Toastify({
        text: `Row deleted from '${tableName}'`,
        backgroundColor: "#dc3545",
      }).showToast()
      setRowToDelete(null)
      getTabeleData(tableName, page)
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleCloseModal = () => setEditRow(null)

  const handleSaveChanges = async () => {
    if (!editRow || !tableName || !primaryKey) return
    const primaryKeyValue = editRow[primaryKey]
    const formData = new FormData(
      document.getElementById("editForm") as HTMLFormElement
    )
    const updatedData: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      if (value === "true" || value === "false") {
        updatedData[key] = value === "true"
      } else if (!isNaN(Number(value))) {
        updatedData[key] = Number(value)
      } else {
        updatedData[key] = value
      }
    }

    try {
      const res = await fetch(
        `http://localhost:3002/api/tables/${tableName}/rows/${primaryKeyValue}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      )
      if (!res.ok) throw new Error("Update failed")
      Toastify({
        text: `Row updated in '${tableName}'`,
        backgroundColor: "#28a745",
      }).showToast()
      handleCloseModal()
      getTabeleData(tableName, page)
    } catch (err) {
      console.error("Update failed:", err)
    }
  }

  const getFieldType = (
    value: any
  ): "text" | "float" | "boolean" | "timestamp" => {
    if (typeof value === "boolean") return "boolean"

    const stringValue = String(value).trim()

    // If it's empty, default to text
    if (!stringValue) return "text"

    // Check for strict timestamp (date or datetime string)
    const timestampRegex = /^\d{4}-\d{2}-\d{2}(T|\s)?(\d{2}:\d{2}(:\d{2})?)?$/ // e.g., 2023-01-01 or 2023-01-01T12:34
    if (timestampRegex.test(stringValue) && !isNaN(Date.parse(stringValue))) {
      return "timestamp"
    }

    // Check if value is a number (integer or float)
    if (/^-?\d+(\.\d+)?$/.test(stringValue)) {
      return "float"
    }

    // If it contains any alphabet character, consider it text
    if (/[a-zA-Z]/.test(stringValue)) {
      return "text"
    }

    // Fallback: if value is non-boolean and not matching the above, assume text
    return "text"
  }

  const totalPages = Math.ceil(totalRecords / LIMIT)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 p-0 bg-light">
          <Sidebar />
        </div>
        <div className="col-md-9 col-lg-10 py-4">
          <h4 className="mb-4">Data for Table: {tableName}</h4>
          {tableData.length > 0 ? (
            <>
              <table className="table table-bordered table-striped">
                <thead className="table-light">
                  <tr>
                    {Object.keys(tableData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, idx) => (
                        <td key={idx}>{value?.toString()}</td>
                      ))}
                      <td>
                        <i
                          className="bi bi-pencil-square text-primary me-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEditClick(row)}></i>
                        <i
                          className="bi bi-trash text-danger"
                          style={{ cursor: "pointer" }}
                          onClick={() => confirmDelete(row)}></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>Total Records: {totalRecords}</div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page - 1)}>
                        Previous
                      </button>
                    </li>
                    {pages.map((pg) => (
                      <li
                        key={pg}
                        className={`page-item ${page === pg ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pg)}>
                          {pg}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        page === totalPages ? "disabled" : ""
                      }`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          ) : (
            <div className="text-muted">No data found.</div>
          )}

          {/* Edit Modal */}
          {editRow && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <form id="editForm">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Record</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCloseModal}></button>
                    </div>
                    <div className="modal-body">
                      {Object.entries(editRow).map(([key, value]) => {
                        const type = getFieldType(value)
                        const isPrimary = key === primaryKey
                        return (
                          <div className="mb-3" key={key}>
                            <label className="form-label">{key}</label>
                            {type === "boolean" ? (
                              <div>
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={key}
                                    value="true"
                                    defaultChecked={value === true}
                                    disabled={isPrimary}
                                  />
                                  <label className="form-check-label">
                                    True
                                  </label>
                                </div>
                                <div className="form-check form-check-inline">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={key}
                                    value="false"
                                    defaultChecked={value === false}
                                    disabled={isPrimary}
                                  />
                                  <label className="form-check-label">
                                    False
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <input
                                name={key}
                                type={
                                  type === "timestamp"
                                    ? "datetime-local"
                                    : type === "float"
                                    ? "number"
                                    : "text"
                                }
                                className="form-control"
                                defaultValue={String(value)}
                                disabled={isPrimary}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="modal-footer">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={handleCloseModal}>
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveChanges}>
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirm Modal */}
          {rowToDelete && (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              role="dialog"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog modal-sm">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Confirm Deletion</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setRowToDelete(null)}></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete this row?
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setRowToDelete(null)}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleDeleteConfirm}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
