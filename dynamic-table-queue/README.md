# Dynamic Table Queue Service

This service is designed to handle the queuing and processing of CSV data uploads for dynamic table creation and management. It uses RabbitMQ for message queuing and communicates with a backend API to sync table schemas and data. The service is built with Express.js and TypeScript, ensuring type safety and scalability.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [RabbitMQ](https://www.rabbitmq.com/) (v3.8 or higher)
- [Docker](https://www.docker.com/) (optional, for running RabbitMQ in a container)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/dynamic-table-queue.git
   cd dynamic-table-queue
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

## Configuration

This service relies on environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```env
# RabbitMQ connection URL
RABBITMQ_URL=amqp://localhost:5672

# Queue name for message processing
QUEUE_NAME=dynamic_table_queue

# Backend API URL for uploading CSV data
UPLOAD_API_URL=http://localhost:3002/api/upload-csv
```

- **RABBITMQ_URL:** The connection string for your RabbitMQ server. If using Docker, you can run RabbitMQ with:

  ```bash
  docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
  ```

- **QUEUE_NAME:** The name of the queue where messages will be published and consumed.

- **UPLOAD_API_URL:** The URL of the backend API endpoint that handles CSV uploads and table syncing.

## Running the Service

### Development Mode

To start the development server with hot-reloading:

```bash
npm run dev
```

This command uses `ts-node-dev` to watch for file changes and restart the server automatically.

### Consumer Mode

To start the consumer that processes messages from the queue:

```bash
npm run consumer
```

This command runs the consumer script located at `src/consumers/consumer.ts`, which connects to RabbitMQ, consumes messages from the specified queue, and uploads the data to the backend API.

## API Routes

The service exposes an API endpoint for publishing CSV data batches to the queue.

### Queue Routes

- **`POST /table-queue`**
  - **Description:** Publishes CSV data batches to the RabbitMQ queue for processing.
  - **Request Body:**
    - `csvName` (string): Name of the table.
    - `fields` (object): Field definitions for the table.
    - `rows` (array): Data rows to insert into the table.
  - **Response:**
    - `200 OK` with `{ message: "Batches published to queue" }`
    - `500 Internal Server Error` if publishing fails.

## Consumer Functionality

The consumer script (`src/consumers/consumer.ts`) performs the following tasks:

1. **Connects to RabbitMQ:** Establishes a connection to the RabbitMQ server using the provided URL.
2. **Consumes Messages:** Listens to the specified queue for incoming messages.
3. **Processes Batches:** For each message, extracts the batch data and uploads it to the backend API via the `UPLOAD_API_URL`.
4. **Updates Notifications:** After successfully uploading a batch, it updates the notification status using the notification key.
5. **Acknowledges Messages:** Acknowledges the message only if the upload and notification update are successful, ensuring reliable processing.

## Additional Information

- **Environment Variables:**

  - `RABBITMQ_URL`: Connection string for RabbitMQ.
  - `QUEUE_NAME`: Name of the queue for message processing.
  - `UPLOAD_API_URL`: URL of the backend API for uploading CSV data.

- **Batch Processing:**

  - CSV data is split into batches of 50 rows each and published to the queue.
  - Each batch includes metadata such as `csvName`, `fields`, `rows`, `batchNumber`, `isFirstBatch`, and `notificationKey`.

- **Notification Management:**
  - A unique notification key is generated for each upload session.
  - Notifications are created when the upload process starts and updated when batches are successfully processed.
