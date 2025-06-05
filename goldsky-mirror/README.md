# Goldsky Mirror for KuruOrderBook

This repository contains the components needed to index KuruOrderBook contract events (Trade) using Goldsky Mirror Pipeline.

## Directory Structure

```
goldsky-mirror/
├── pipeline/        # Goldsky Mirror Pipeline configuration
│   └── kuru-logs-pipeline.yaml
└── webhook/         # Express server for handling Pipeline webhook events
    ├── src/         # Source code
    ├── Dockerfile   # Container configuration
    └── package.json # Dependencies
```

## Components

### Pipeline Configuration

The pipeline configuration (`kuru-logs-pipeline.yaml`) defines a Goldsky Mirror pipeline that:
- Sources data from Monad testnet logs
- Filters for specific contract addresses
- Forwards events to the webhook server

### Webhook Server

The Express server processes blockchain data from the Goldsky pipeline:
- Receives and decodes Trade events from contract logs
- Broadcasts events via WebSocket to connected clients
- Stores events in a PostgreSQL database

Can we include a brief mention of the websocket service at the top?
### WebSocket Service

The server includes a WebSocket service for real-time event broadcasting:
- Runs on a configurable port (default: 8080)
- Maintains client connections with heartbeat mechanism
- Broadcasts Trade events to all connected clients
- Provides connection status and event updates

## Setup

1.  **Navigate to the webhook directory:**
    ```bash
    cd webhook
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` and configure:
    ```bash
    cp .env.example .env
    ```
    Required variables:
    - `DATABASE_URL`: PostgreSQL connection string
    - `WEBHOOK_PORT`: HTTP server port (default: 3000)
    - `WS_PORT`: WebSocket server port (default: 8080)

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

Can we document the message types that come through the WS? Same for all other implementations that expose a server
## WebSocket Client Connection

To connect to the WebSocket server and receive real-time Trade events:

```javascript
const ws = new WebSocket('ws://your-server:8080');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connection') {
    console.log('Connected to server');
  }
  
  if (data.type === 'events') {
    console.log('Received trade events:', data.events.trade);
  }
};
```

## Setup

1.  Set up and run the [Webhook Server](#webhook-server) (locally or deployed, Docker container available). Ensure necessary environment variables (e.g., database connection) are configured.
2.  Deploy the Goldsky Mirror pipeline defined in `pipeline/kuru-logs-pipeline.yaml`, pointing its webhook sink to the running webhook server endpoint.

## Usage

Once deployed, the system automatically:
1. Monitors the Monad testnet blockchain for logs from KuruOrderBook contracts
2. Processes Trade events through the Goldsky pipeline
3. Stores events in the database and broadcasts them to WebSocket clients
