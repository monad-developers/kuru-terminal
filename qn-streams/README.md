# Kuru Quicknode Streams Webhook

This folder contains the components needed to process and index KuruOrderBook contract events (Trade) using Quicknode Streams.

## Directory Structure

```
qn-streams/
├── README.md
├── webhook/         # Express server for handling Quicknode Streams events
    ├── src/         # Source code
    ├── Dockerfile   # Container configuration
    └── package.json # Dependencies
```

## Components

### Webhook Server

The Express server processes events from Quicknode Streams:
- Receives and validates webhook events
- Processes Trade events from the KuruOrderBook contract
- Stores the event data in a PostgreSQL database using Drizzle ORM

**Running the Webhook Server:**

1.  **Navigate to the webhook directory:**
    ```bash
    cd webhook
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` and configure database connection details.
    ```bash
    cp .env.example .env
    ```
4.  **Run locally (development):**
    ```bash
    pnpm dev
    ```
5.  **Run in production:**
    First, build the server:
    ```bash
    pnpm build
    ```
    Then, start the server:
    ```bash
    pnpm start
    ```

A Dockerfile is also provided for containerized deployment.

## Setup

1.  Set up and run the [Webhook Server](#webhook-server) (locally or deployed, Docker container available). Ensure necessary environment variables (e.g., database connection) are configured.
2.  Deploy a Quicknode Stream using the provided [Filter Function](#quicknode-stream-filter) and point its webhook destination to the running webhook server endpoint.

## Architecture

The service is built with:
- Express.js for the web server
- Drizzle ORM for type-safe database operations
- Ethers.js for blockchain data decoding and interaction
- PostgreSQL for persistent storage

Once deployed, the system automatically:
1. Receives webhook events from Quicknode Streams
2. Processes Trade events from the KuruOrderBook contract
3. Stores the processed data in PostgreSQL for use in applications

## QuickNode Stream Filter

The following filter function is used in QuickNode streams to filter logs from Kuru orderbook contracts:

```javascript
async function main(stream) {
  // If stream is configured with metadata in the body, the data may be nested under a "data" key
  const data = stream.data ? stream.data : stream;
  
  // Map of Kuru orderbook contract addresses and their trading pair names
  const kuruOrderbookAddresses = new Set([
    "0xd3af145f1aa1a471b5f0f62c52cf8fcdc9ab55d3", // MONUSDC
    // Add more contract addresses here for additional trading pairs
  ]);
  
  // Array to collect logs only from Kuru orderbook contracts
  const logs = [];
  
  // Process nested data: blocks -> transactions -> logs
  for (const blockLogs of data) {
    for (const txLogs of blockLogs) {
      for (const log of txLogs) {
        // Filter logs to include only those from Kuru orderbook contracts
        if (kuruOrderbookAddresses.has(log.address.toLowerCase())) {
          logs.push(log);
        }
      }
    }
  }
  
  return logs;
}
```
