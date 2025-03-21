import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import {
  trade,
  orderCreated,
  ordersCanceled,
  initialized,
  ownershipHandoverCanceled,
  ownershipHandoverRequested,
  ownershipTransferred,
  upgraded,
} from "./db/goldsky-schema";
import { EventRequestBody } from "./types";
import { processKuruEventsFromLogs } from "./utils";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

console.log(`[${new Date().toISOString()}] Starting server with:`);
console.log(`- PORT: ${PORT}`);
console.log(`- Database URL: (set)`);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", async (req, res) => {
  res.status(200).send("Kuru Indexer Goldsky Mirror Webhook");
});

app.post("/", async (req, res) => {
  try {
    const { data } = req.body as EventRequestBody;
    console.log(`[${new Date().toISOString()}] Received ${data.length} events`);
    
    const events = processKuruEventsFromLogs(data);
    console.log(`[${new Date().toISOString()}] Processing ${events.trade.length} trades, ${events.orderCreated.length} order creations, ${events.ordersCanceled.length} order cancellations, ${events.initialized.length} initializations, ${events.ownershipHandoverCanceled.length} ownership handover cancellations, ${events.ownershipHandoverRequested.length} ownership handover requests, ${events.ownershipTransferred.length} ownership transfers, ${events.upgraded.length} upgrades`);

    // Insert events into respective tables
    const insertPromises = [];
    
    if (events.trade.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.trade.length} trades`);
      insertPromises.push(db.insert(trade).values(events.trade));
    }
    if (events.orderCreated.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.orderCreated.length} order creations`);
      insertPromises.push(db.insert(orderCreated).values(events.orderCreated));
    }
    if (events.ordersCanceled.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.ordersCanceled.length} order cancellations`);
      insertPromises.push(db.insert(ordersCanceled).values(events.ordersCanceled));
    }
    if (events.initialized.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.initialized.length} initializations`);
      insertPromises.push(db.insert(initialized).values(events.initialized));
    }
    if (events.ownershipHandoverCanceled.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.ownershipHandoverCanceled.length} ownership handover cancellations`);
      insertPromises.push(db.insert(ownershipHandoverCanceled).values(events.ownershipHandoverCanceled));
    }
    if (events.ownershipHandoverRequested.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.ownershipHandoverRequested.length} ownership handover requests`);
      insertPromises.push(db.insert(ownershipHandoverRequested).values(events.ownershipHandoverRequested));
    }
    if (events.ownershipTransferred.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.ownershipTransferred.length} ownership transfers`);
      insertPromises.push(db.insert(ownershipTransferred).values(events.ownershipTransferred));
    }
    if (events.upgraded.length > 0) {
      console.log(`[${new Date().toISOString()}] Inserting ${events.upgraded.length} upgrades`);
      insertPromises.push(db.insert(upgraded).values(events.upgraded));
    }

    await Promise.all(insertPromises);
    res.status(200).json(events);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing request:`, error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Start the server with better error handling
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
