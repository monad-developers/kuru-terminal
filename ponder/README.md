# Ponder Indexer

This directory contains the Ponder configuration and indexing logic for Kuru Orderbook contracts.

## Core Files

*   **`ponder.config.ts`**: Defines the main configuration for the Ponder indexer.
    *   Sets up the database connection (PostgreSQL in this case, configurable via environment variables).
    *   Specifies the network (`monadTestnet` with Chain ID 10143) and RPC URL.
    *   Lists the Kuru Orderbook contract addresses to monitor and the specific event (`Trade`) to index.
    *   Includes the start block for indexing.
*   **`ponder.schema.ts`**: Defines the data schema for the indexed events.
    *   Uses `onchainTable` to define the `trade` table structure, mapping directly to the `Trade` event parameters (like `orderId`, `makerAddress`, `price`, `filledSize`, etc.).
    *   Specifies data types (e.g., `bigint`, `hex`, `boolean`).
    *   Includes database index definitions for efficient querying (e.g., on `blockHeight`, `txHash`, `orderId`).
*   **`src/index.ts`**: Contains the event handler logic.
    *   The `ponder.on("KuruOrderBookAbi:Trade", ...)` function defines how to process each `Trade` event.
    *   It extracts relevant data from the `event.args` and `event.block`.
    *   It generates a unique `id` using `uuidv4`.
    *   It uses `context.db.insert(trade).values(...)` to insert the processed data into the `trade` table defined in the schema.

## Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env` (or `.env.local`) and fill in the required environment variables:
    ```bash
    cp .env.example .env
    ```
    You need to provide:
    *   `PONDER_RPC_URL_10143`: An RPC URL for the Monad Testnet (Chain ID 10143).
    *   `DATABASE_URL` (Optional): A PostgreSQL connection string. If not provided, Ponder will use SQLite.

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    This starts the Ponder indexer and serves a GraphQL API.

4.  **Start the indexer:**
    ```bash
    pnpm start
    ```
    This runs the indexer service.

## Other Commands

*   **Database commands:** `pnpm db`
*   **Codegen:** `pnpm codegen`
*   **Lint:** `pnpm lint`
*   **Typecheck:** `pnpm typecheck` 