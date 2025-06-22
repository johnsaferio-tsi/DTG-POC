import { useEffect, useState } from "react"
import Link from "next/link"
import "bootstrap/dist/css/bootstrap.min.css"
import React from "react"

const Sidebar = () => {
  const [tables, setTables] = useState<string[]>([])

  const getTabeleDtetails = async () => {
    const tableRes = await fetch("http://localhost:3002/api/tables")
    const tableData = await tableRes.json()
    const tableList = tableData.map(
      (table: { tableName: string }) => table.tableName
    )
    setTables([...tableList])
  }

  useEffect(() => {
    getTabeleDtetails()
  }, [])

  return (
    <div className="d-flex flex-column p-3 bg-light vh-100">
      <h5 className="mb-4">Navigation</h5>

      <ul className="nav nav-pills flex-column mb-3">
        <li className="nav-item">
          <Link href="/upload" className="nav-link">
            <i className="bi bi-upload me-2"></i>Upload
          </Link>
        </li>
      </ul>

      <h6 className="text-muted">List of Tables</h6>
      <ul className="nav flex-column">
        {tables.length === 0 ? (
          <li className="nav-item text-muted small ms-2">No tables found</li>
        ) : (
          tables.map((table) => (
            <li key={table} className="nav-item">
              <Link href={`/tables/${table}`} className="nav-link">
                {table}
              </Link>
            </li>
          ))
        )}
      </ul>

      <h6 className="text-muted mt-3">Diagrams</h6>
      <ul className="nav flex-column">
        <li key={"dfd"} className="nav-item">
          <Link href={`/dfd`} className="nav-link">
            Data Flow Diagram
          </Link>
        </li>
        <li key={"erd"} className="nav-item">
          <Link href={`/erd`} className="nav-link">
            Entity Relationship Diagram
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
