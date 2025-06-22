# Dynamic Table Backend

This is a backend service built with Express.js and Prisma that enables dynamic table creation and management based on uploaded CSV files. It supports syncing table schemas, uploading data, and performing CRUD operations on dynamically created tables, along with notification management.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [Prisma CLI](https://www.prisma.io/docs/getting-started) (installed globally or as a dev dependency via `npm install prisma --save-dev`)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/johnsaferio-tsi/DTG-POC.git
   cd dynamic-table-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Database Setup

This project uses Prisma for database management with a PostgreSQL database. Follow these steps to set up your database:

1. **Configure your database connection:**

   - Create a `.env` file in the root directory.
   - Add your PostgreSQL database URL:

     ```env
     DATABASE_URL="postgresql://username:password@localhost:5432/yourdatabase?schema=public"
     ```

2. **Prisma Migration Process:**

   - Prisma uses migrations to manage database schema changes. The initial migration will set up the necessary metadata tables (`DataTableDefinition`, `SchemaLog`, and `Notification`) as defined in the Prisma schema.
   - To apply the initial migration and create these tables in your database, run:

     ```bash
     npx prisma migrate dev --name init
     ```

     This command:

     - Creates a migration file in `prisma/migrations/`.
     - Applies the schema changes to your database.
     - Seeds the database if a seed script is provided (optional).

   - If you modify the Prisma schema later (e.g., adding new models or fields), create and apply a new migration with:

     ```bash
     npx prisma migrate dev --name <migration_name>
     ```

   - Alternatively, to sync the schema directly without creating a migration file (useful for prototyping), use:

     ```bash
     npx prisma db push
     ```

3. **Generate Prisma Client:**

   - After running migrations or pushing the schema, generate the Prisma Client to interact with your database:

     ```bash
     npx prisma generate
     ```

## Running the Application

### Development Mode

To start the development server with hot-reloading:

```bash
npm run dev
```

This uses `ts-node-dev` to watch for file changes and restart the server automatically.

### Production Mode

1. **Build the project:**

   ```bash
   npm run build
   ```

   This compiles the TypeScript code into JavaScript in the `dist` directory.

2. **Start the production server:**

   ```bash
   npm start
   ```

## API Routes

The backend service exposes several API endpoints for managing dynamic tables and notifications.

### Upload Routes

- **`POST /upload-csv`**
  - **Description:** Uploads a CSV file and syncs the table schema and data.
  - **Request Body:**
    - `csvName` (string): Name of the table.
    - `fields` (object): Field definitions for the table.
    - `rows` (array): Data rows to insert into the table.
    - `isFirstBatch` (boolean): Indicates if this is the first batch of data.
  - **Response:**
    - `200 OK` with `{ message: "Table '<csvName>' synced successfully." }`
    - `400 Bad Request` if the payload is invalid.
    - `500 Internal Server Error` on failure.

### Table Routes

- **`GET /tables`**

  - **Description:** Retrieves a list of all dynamic table names.
  - **Response:** Array of objects with `tableName` properties.

- **`GET /tables/:tableName/schema`**

  - **Description:** Retrieves the schema of a specific dynamic table.
  - **Response:** Schema details or `404 Not Found` if the table does not exist.

- **`GET /tables/:tableName/rows`**

  - **Description:** Retrieves rows from a dynamic table with pagination.
  - **Query Parameters:**
    - `limit` (number): Number of rows to return (default: 100).
    - `offset` (number): Number of rows to skip (default: 0).
  - **Response:** `{ rows, primaryKey, totalCount }` or `404 Not Found` if the table does not exist.

- **`GET /tables/:tableName/search`**

  - **Description:** Performs a case-insensitive search on a specified column.
  - **Query Parameters:**
    - `column` (string): Column to search.
    - `value` (string): Value to search for.
  - **Response:** Matching rows or `400 Bad Request` if parameters are missing/invalid.

- **`PUT /tables/:tableName/rows/:primaryKeyValue`**

  - **Description:** Updates a row in the dynamic table.
  - **Request Body:** Object with fields to update.
  - **Response:** Success message or `404 Not Found`/`400 Bad Request`/`500 Internal Server Error` on failure.

- **`DELETE /tables/:tableName/rows/:primaryKeyValue`**
  - **Description:** Deletes a row from the dynamic table.
  - **Response:** Success message or `404 Not Found`/`400 Bad Request`/`500 Internal Server Error` on failure.

### Notification Routes

- **`GET /notifications`**

  - **Description:** Retrieves all notifications.
  - **Response:** List of notification objects.

- **`POST /notifications`**

  - **Description:** Creates a new notification.
  - **Request Body:**
    - `message` (string): Notification message.
    - `tableName` (string): Associated table name.
    - `notificationKey` (string): Unique key for the notification.
  - **Response:** Created notification object.

- **`PATCH /notifications/:id/created`**

  - **Description:** Marks a notification as 'CREATED' by ID.
  - **Response:** Updated notification object.

- **`PATCH /notifications/:id/read`**

  - **Description:** Marks a notification as read by ID.
  - **Response:** Updated notification object.

- **`PATCH /notifications/by-key`**
  - **Description:** Marks a notification as 'CREATED' by notification key.
  - **Request Body:**
    - `notificationKey` (string): Key of the notification.
  - **Response:** `{ success: true }`.

## Additional Information

- **Environment Variables:**

  - `DATABASE_URL`: PostgreSQL connection string (required).

- **Prisma Migrations:**

  - Use `npx prisma migrate dev --name <migration_name>` for schema changes with migrations.
  - Use `npx prisma db push` to sync the schema directly without migrations (e.g., during early development).

- **Dynamic Table Management:**
  - The `syncDynamicTable` function in `src/services/tableService.ts` handles the creation and updating of dynamic tables based on CSV data.
  - Ensure CSV data is properly formatted and field definitions are correctly specified.
