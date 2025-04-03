# Kuru Quicknode Streams Webhook

This folder contains the components needed to process and index KuruOrderBook contract events using Quicknode Streams.

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

## Setup

1. Deploy the webhook server (Docker container available)
2. Configure environment variables for database connection
3. Deploy the Quicknode Stream pointing to the webhook server

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
function main(stream) {
  // If stream is configured with metadata in the body, the data may be nested under a "data" key
  const data = stream.data ? stream.data : stream;
  
  // Map of Kuru orderbook contract addresses and their trading pair names
  const kuruOrderbookAddresses = new Set([
    "0xd3af145f1aa1a471b5f0f62c52cf8fcdc9ab55d3",
    "0x94b72620e65577de5fb2b8a8b93328caf6ca161b",
    "0x277bf4a0aac16f19d7bf592feffc8d2d9a890508",
    "0xd5c1dc181c359f0199c83045a85cd2556b325de0"
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
