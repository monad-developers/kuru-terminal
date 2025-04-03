import app from "./app";
import dotenv from "dotenv";
import { createLogger } from "./utils/logger.util";
import { stopIndexer } from "./services/indexer.service";

// Create logger for this module
const logger = createLogger('Server');

// Load environment variables
dotenv.config();

// Set the port
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Kuru Indexer Thirdweb Insight API server is running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down server gracefully");
  await stopIndexer();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds if server.close() doesn't complete
  setTimeout(() => {
    logger.error("Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down server gracefully");
  await stopIndexer();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  
  // Force exit after 10 seconds if server.close() doesn't complete
  setTimeout(() => {
    logger.error("Forcing server shutdown after timeout");
    process.exit(1);
  }, 10000);
});
