// src/pages/index.tsx
import Head from "next/head"
import "bootstrap/dist/css/bootstrap.min.css"
import Sidebar from "../Components/Sidebar"

export default function Home() {
  return (
    <>
      <Head>
        <title>Dynamic Table Creator</title>
        <meta
          name="description"
          content="Create and manage dynamic tables from CSV files"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar Column */}
          <div className="col-md-3 col-lg-2 p-0 bg-light">
            <Sidebar />
          </div>

          {/* Main Content Column */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <h2 className="mb-4">Welcome to Dynamic Table Creator</h2>
            <p className="text-muted">
              Use the sidebar to upload CSV files or explore existing tables.
            </p>
          </main>
        </div>
      </div>
    </>
  )
}
