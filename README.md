# DTG-POC: Dynamic Table Generator Proof of Concept

## Project Overview

The **Dynamic Table Generator (DTG-POC)** is a proof-of-concept application designed to streamline the process of creating and managing database tables dynamically from uploaded CSV files. The app was developed to address the inefficiencies and potential errors associated with manually creating database tables for each CSV dataset, a task that becomes increasingly challenging with large data volumes.

### Why This App Was Built

The primary motivation for building DTG-POC was to automate and simplify the ingestion and management of CSV data into a database. The app achieves this by:

1. Allowing users to upload CSV files via a frontend interface.
2. Analyzing the CSV data to infer column types and suggest primary keys.
3. Obtaining user approval for the inferred types and keys.
4. Dynamically generating tables in the backend database.
5. Providing a frontend dashboard for managing the created tables.
6. Implementing a queuing system to efficiently process large datasets in batches.

This solution enhances productivity, reduces errors, and ensures scalability, making it ideal for handling dynamic datasets of varying sizes.

## Features

- **CSV Upload and Analysis**: Automatically reads and analyzes CSV files to determine column types and suggest primary keys.
- **User Approval**: Enables users to confirm or adjust the inferred types and keys before table creation.
- **Dynamic Table Creation**: Generates tables in the backend database based on the approved structure.
- **Frontend Dashboard**: Offers a user-friendly interface to view and manage created tables.
- **Batch Processing**: Uses a queuing system to split large datasets into manageable batches for processing.
- **Notifications**: Keeps users informed with updates during table creation and batch processing.

## Services

The following services drive the DTG-POC application:

- **DTC Frontend (Port: 3000)**: Manages CSV uploads, user approvals, and table management dashboard.
- **DTC Backend (Port: 3002)**: Handles table creation and database interactions.
- **DTC Queue (Port: 3003)**: Processes large datasets via batch queuing.

_Note: Service names are inferred from the DFD; replace with actual names from your `.md` files if different._

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/johnsaferio-tsi/DTG-POC.git
   ```
2. Navigate to the project directory:
   ```bash
   cd DTG-POC
   ```
3. Follow the internal README.md of each folder
