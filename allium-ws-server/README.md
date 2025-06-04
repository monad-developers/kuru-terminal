# Allium WebSocket Server

This directory contains a WebSocket server that processes Kuru Orderbook events (Trade) sourced from an Allium Datastream (via Confluent Cloud Kafka), broadcasts them to connected clients via WebSocket, and persists them to a PostgreSQL database.

## Features

*   Connects to a Confluent Cloud Kafka cluster to consume Allium Datastreams.
*   Decodes Kuru Orderbook contract event (`Trade`).
*   Broadcasts processed events to connected WebSocket clients.
*   **Persists Trade events to PostgreSQL database using Drizzle ORM.**

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file with the following variables:
    ```bash
    # Server Configuration
    PORT=8080

    # Database Configuration (PostgreSQL via Neon or any Postgres provider)
    DATABASE_URL=postgresql://username:password@host:port/database

    # Kafka Configuration (Allium Datastreams)
    BOOTSTRAP_SERVERS=your-kafka-bootstrap-server
    CLUSTER_API_KEY=your-cluster-api-key
    CLUSTER_API_SECRET=your-cluster-api-secret
    ```

3.  **Database Setup:**
    
    **Generate and run database migrations:**
    ```bash
    npm run db:generate
    npm run db:push
    ```
    
    **Alternative: Use Drizzle migration commands:**
    ```bash
    npm run db:migrate
    ```

4.  **Build the server:**
    ```bash
    npm run build
    ```

5.  **Run the server:**
    *   **Development:**
        ```bash
        npm run dev
        ```
    *   **Production (after building):**
        ```bash
        npm start
        ```

## Database Schema

The server uses a `trade` table with the following structure:

```sql
CREATE TABLE trade (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  transaction_hash TEXT,
  block_height NUMERIC(78, 0),
  order_book_address TEXT,
  order_id NUMERIC(78, 0),
  tx_origin TEXT,
  maker_address TEXT,
  taker_address TEXT,
  is_buy BOOLEAN,
  price NUMERIC(78, 0),
  updated_size NUMERIC(78, 0),
  filled_size NUMERIC(78, 0)
);
```

## Architecture

1. **Kafka Consumer**: Consumes events from Allium Datastream
2. **Event Processing**: Decodes and validates Trade events
3. **WebSocket Broadcasting**: Sends events to connected clients
4. **Database Persistence**: Saves events to PostgreSQL using Drizzle ORM

The system is designed to continue operating even if database operations fail, ensuring WebSocket functionality remains available.

## Connecting

WebSocket clients can connect to `ws://localhost:{PORT}` (or the deployed server address) to receive Trade events. 