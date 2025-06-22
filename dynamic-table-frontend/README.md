# Dynamic Table Creator

Dynamic Table Creator is a web application built with Next.js that allows users to upload CSV files, create dynamic tables, and visualize data flow and entity relationships. The application provides a user-friendly interface for managing tabular data with support for file uploads, table rendering, and diagrammatic representations of the application's structure.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Dependencies](#dependencies)

## Features

- **CSV Upload**: Upload CSV files through a drag-and-drop interface or file selection.
- **Dynamic Table Rendering**: Display tables dynamically based on uploaded CSV data.
- **Data Flow Diagram (DFD)**: Visualize the application's data flow.
- **Entity Relationship Diagram (ERD)**: Display the entity relationships within the application.
- **Responsive Design**: Styled with Bootstrap for a consistent and responsive UI.
- **Notifications**: User feedback via Toastify.js for success/error messages.
- **API Integration**: Backend communication for processing CSV files and fetching table data.

## Tech Stack

- **Framework**: Next.js 15.3.4
- **Frontend**: React 19.0.0, React DOM 19.0.0
- **Styling**: Bootstrap 5.3.7
- **File Upload Handling**: Formidable 3.5.4, React Dropzone 14.3.8
- **CSV Parsing**: csv-parse 5.6.0
- **Notifications**: Toastify.js 1.12.0
- **Type Safety**: TypeScript 5
- **Development Tools**: TypeScript type definitions for Node, React, React DOM, Formidable, and Toastify.js

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/johnsaferio-tsi/DTG-POC.git
   cd dynamic-table-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure you have Node.js (version compatible with Next.js 15.3.4) installed.

## Usage

1. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

2. Navigate to the following routes:

   - **Home (`/`)**: Landing page (`index.tsx`).
   - **Upload (`/upload`)**: Upload CSV files to create tables (`upload.tsx`).
   - **Tables (`/tables/[tableName]`)**: View dynamic tables based on uploaded data (`[tableName].tsx`).
   - **Data Flow Diagram (`/dfd`)**: View the application's data flow diagram (`dfd.tsx`).
   - **Entity Relationship Diagram (`/erd`)**: View the application's entity relationship diagram (`erd.tsx`).

3. To interact with the backend, the API route (`/api/readfile`) handles CSV file processing.

## Project Structure

```
dynamic-table-creator/
├── Examples/
│   ├── users.csv
│   ├── products.csv
│   └── books_150.tsx
├── pages/
│   ├── api/
│   │   └── readfile.ts       # API route for processing CSV files
│   ├── tables/
│   │   └── [tableName].tsx   # Dynamic route for displaying tables
│   ├── _app.tsx              # Custom App component for Next.js
│   ├── _document.tsx         # Custom Document component for Next.js
│   ├── dfd.tsx               # Data Flow Diagram page
│   ├── erd.tsx               # Entity Relationship Diagram page
│   ├── index.tsx             # Home page
│   └── upload.tsx            # CSV file upload page
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

### Page Descriptions

- **`upload.tsx`**: Provides a drag-and-drop interface (using React Dropzone) for uploading CSV files. Once approved, the file is sent to the backend via the `/api/readfile` endpoint to create tables.
- **`[tableName].tsx`**: Dynamically renders tables by fetching data from the backend based on the table name in the URL.
- **`dfd.tsx`**: Displays a Data Flow Diagram representing the application's data flow.
- **`erd.tsx`**: Displays an Entity Relationship Diagram outlining the application's data structure.
- **`index.tsx`**: The main landing page of the application.
- **`api/readfile.ts`**: Backend API route to handle CSV file parsing and table creation.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint to check for code quality issues.

## Dependencies

### Production Dependencies

- `bootstrap`: For responsive styling.
- `csv-parse`: For parsing uploaded CSV files.
- `formidable`: For handling file uploads on the server.
- `next`: Next.js framework for server-side rendering and routing.
- `react`, `react-dom`: React library for building the UI.
- `react-dropzone`: For drag-and-drop file uploads.
- `toastify-js`: For displaying toast notifications.

### Development Dependencies

- `@types/formidable`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/toastify-js`: TypeScript type definitions.
- `typescript`: For type-safe JavaScript development.

### Note

- Please refer **Example** folder for .csv files for reference and testing
