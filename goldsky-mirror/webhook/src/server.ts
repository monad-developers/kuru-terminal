import dotenv from "dotenv";
dotenv.config();

import app from "./app";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[${new Date().toISOString()}] Server is running on port ${PORT} and bound to all interfaces (0.0.0.0)`
  );
}).on('error', (error) => {
  console.error(`[${new Date().toISOString()}] Failed to start server:`, error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Received SIGTERM signal. Shutting down gracefully...`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] Server closed`);
    process.exit(0);
  });
});
