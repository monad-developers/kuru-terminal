/*
  There's quite a few files of boilerplate for the websocket server and implementation

  Is it possible to unify this into a shared module that all the implementations can use?
*/

import { expressApp, eventWsManager } from "./app";

const WEBHOOK_PORT = Number(process.env.WEBHOOK_PORT) || 3000;
const WS_PORT = Number(process.env.WS_PORT) || 8080;

// Initialize WebSocket service
eventWsManager.initializeWsStream(WS_PORT);
console.log(`[${new Date().toISOString()}] WebSocket server initialized on port ${WS_PORT}`);

// Start the server
const server = expressApp.listen(WEBHOOK_PORT, "0.0.0.0", async () => {
  console.info(
    `[${new Date().toISOString()}] Webhook server is running on port ${WEBHOOK_PORT} and bound to all interfaces (0.0.0.0)`
  );
});

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  console.info("[${new Date().toISOString()}] SIGTERM received, shutting down server gracefully");
  
  // Shutdown WebSocket service
  eventWsManager.shutdownWsStream();
  
  server.close(() => {
    console.info("[${new Date().toISOString()}] Webhook server closed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds if server.close() doesn't complete
  setTimeout(() => {
    console.error("[${new Date().toISOString()}] Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000);
});

process.on("SIGINT", async () => {
  console.info("[${new Date().toISOString()}] SIGINT received, shutting down server gracefully");
  
  // Shutdown WebSocket service
  eventWsManager.shutdownWsStream();
  
  server.close(() => {
    console.info("[${new Date().toISOString()}] Webhook server closed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds if server.close() doesn't complete
  setTimeout(() => {
    console.error("[${new Date().toISOString()}] Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000);
});
