import express from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { trade } from "./db/schema";
import { LogEntry } from "./types";
import { getTradeEventsFromLogs } from "./services/trade-event-transformer.service";
import { EventWsStream } from "./services/event-ws-stream.service";

import "dotenv/config";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}


// WebSocket Stream Manager

/**
 * Manager for WebSocket event streaming service
 * Implemented as a singleton to ensure the same instance is used throughout the application
 */
class EventWsStreamManager {
  private static instance: EventWsStreamManager;
  private eventWsStream: EventWsStream | null = null;

  private constructor() { }

  /**
   * Get the singleton instance of the event WebSocket manager
   */
  public static getInstance(): EventWsStreamManager {
    if (!EventWsStreamManager.instance) {
      EventWsStreamManager.instance = new EventWsStreamManager();
    }
    return EventWsStreamManager.instance;
  }

  /**
   * Initialize the WebSocket streaming service
   */
  public initializeWsStream(port: number): void {
    if (!this.eventWsStream) {
      this.eventWsStream = new EventWsStream(port);
    }
  }

  /**
   * Get the WebSocket streaming service instance
   */
  public getWsStream(): EventWsStream {
    if (!this.eventWsStream) {
      throw new Error('WebSocket streaming service not initialized');
    }
    return this.eventWsStream;
  }

  /**
   * Shutdown WebSocket streaming service
   */
  public shutdownWsStream(): void {
    if (this.eventWsStream) {
      this.eventWsStream.shutdown();
    }
  }
}

// Export singleton instance for use in both app and server
export const eventWsManager = EventWsStreamManager.getInstance();

// Express Application

export const expressApp = express();

expressApp.use(bodyParser.json({ limit: "10mb" }));
expressApp.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

expressApp.get("/", async (req, res) => {
  res.status(200).send("Kuru Indexer Quicknode Streams Hook");
});

expressApp.post("/", async (req, res) => {
  const data = req.body as LogEntry[];

  try {
    const tradeEvents = getTradeEventsFromLogs(data);

    // Broadcast events to connected WebSocket clients
    try {
      const eventWsStream = eventWsManager.getWsStream();
      eventWsStream.broadcastTradeEvents(tradeEvents);
      const clientCount = eventWsStream.getConnectedClientCount();
      if (clientCount > 0) {
        console.log(`[${new Date().toISOString()}] Events broadcast to ${clientCount} connected clients`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error broadcasting events:`, error);
      // Continue processing even if broadcasting fails
    }

    if (tradeEvents.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Inserting ${tradeEvents.length} trades into DB`
      );
      // Insert trades into DB
      await db.insert(trade).values(tradeEvents);
    }
    res.status(200).send(JSON.stringify(tradeEvents));
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] Error processing request:`,
      error
    );
    res.status(500).send(`Internal Server Error: ${error}`);
  }
});
