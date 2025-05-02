# Thirdweb Insight API Indexer

This app provides an indexing service for smart contract events on Monad Testnet using thridweb Insight API and a WebSocket server for broadcasting events to clients. As an example, we use the Kuru Orderbook contracts.

## Features

- **Background Indexing**: Continuously indexes events from Kuru contracts using the thirdweb Insight API
- **WebSocket Broadcasting**: Broadcasts events to connected clients
- **Automatic Reconnection**: Automatically reconnects to the thirdweb Insight API
- **Event Persistence**: Persists events in a database for historical tracking

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
   - **Development:**
     ```
     pnpm dev
     ```
   - **Production (after building with `pnpm build`):**
     ```
     pnpm start
     ```

## WebSocket Client Connection

Connect to the WebSocket server at `ws://localhost:8080` (or your configured port).

### Event Format

Events are broadcasted in the following format:

```typescript
{
  type: 'events',
  timestamp: string,
  events: {
    trade: TradeEvent[]
  }
}
```

### Heartbeat

The server implements a heartbeat mechanism to maintain connection health:
- Server sends ping every 30 seconds
- Clients must respond with pong
- Connections are terminated if no pong is received
