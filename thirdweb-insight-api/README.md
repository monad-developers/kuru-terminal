# Kuru Indexer - thirdweb Insight API

This app provides an indexing service for smart contract events on Monad Testnet using thridweb Insight API and an API service for querying them. As an example, we use the Kuru Orderbook contracts.

## Features

- **Background Indexing**: Continuously indexes events from Kuru contracts using the thirdweb Insight API
- **REST API**: Simple API for querying indexed events
- **Sorting**: Customizable sorting of results
- **Status Endpoint**: Check the indexer status and event counts

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- thirdweb Client ID

## Getting Started

1. Clone the repository
2. Install dependencies
   ```
   pnpm install
   ```
3. Create a `.env` file based on `.env.example` and configure your environment variables
4. Run database migrations
   ```
   pnpm db:migrate
   ```
5. Start the server
   ```
   pnpm start
   ```

## API Endpoints

### GET /

Home endpoint to check if the API is running.

### GET /status

Get the current status of the indexer including the last indexed block and event counts.

### GET /events

Query events from the indexer.

Query Parameters:
- `event_type` (required): The type of event to query (e.g., "trade", "orderCreated")
- `sort_by` (optional): The field to sort by (default: "block_number")
- `sort_order` (optional): The sort order, either "asc" or "desc" (default: "desc")
- `limit` (optional): The number of events to return per page (default: 20, max: 100)

Example:
```
GET /events?event_type=trade&sort_by=block_number&sort_order=desc&limit=10
```

## Project Structure

- `src/app.ts`: Express application setup
- `src/server.ts`: Server startup
- `src/services/indexer.ts`: Background indexing logic
- `src/services/eventProcessor.ts`: Event processing and database storage
- `src/services/api.ts`: API logic for retrieving events
- `src/utils.ts`: Utility functions
- `src/types.ts`: TypeScript type definitions
- `src/db/`: Database schema and connection
- `config/`: Contract configuration
