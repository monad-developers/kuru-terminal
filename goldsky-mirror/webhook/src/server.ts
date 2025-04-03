import dotenv from "dotenv";
dotenv.config();

import { expressApp, eventWsManager } from "./app";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT) || 3000;
const WS_PORT = Number(process.env.WS_PORT) || 8080;

// Initialize WebSocket service
eventWsManager.initializeWsStream(WS_PORT);
console.log(`[${new Date().toISOString()}] WebSocket server initialized on port ${WS_PORT}`);

const server = expressApp.listen(WEBHOOK_PORT, "0.0.0.0", () => {
  console.log(
    `[${new Date().toISOString()}] HTTP server is running on port ${WEBHOOK_PORT} and bound to all interfaces (0.0.0.0)`
  );
}).on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Failed to start HTTP server:`, error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Received SIGTERM signal. Shutting down gracefully...`);
  
  // Shutdown event WebSocket stream
  eventWsManager.shutdownWsStream();
  
  server.close(() => {
    console.log(`[${new Date().toISOString()}] HTTP server closed`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Received SIGINT signal. Shutting down gracefully...`);
  
  // Shutdown WebSocket service
  eventWsManager.shutdownWsStream();
  
  server.close(() => {
    console.log(`[${new Date().toISOString()}] HTTP server closed`);
    process.exit(0);
  });
});
