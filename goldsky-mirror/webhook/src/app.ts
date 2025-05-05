import express from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { sql } from "drizzle-orm";
import { trade } from "./db/schema";
import { RawLog } from "./types";
import { getKuruEventsFromLogs } from "./services/event-transformer.service";
import { EventWsStream } from "./services/event-ws-stream.service";

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
  res.status(200).send("Kuru Indexer Goldsky Mirror Webhook");
});

/**
 * Main webhook endpoint for processing blockchain events
 * Currently processes Trade events only
 * 
 * Note: To add support for more events:
 * 1. Import new event table from schema
 * 2. Add event processing logic as needed (DB update, WebSocket broadcast, etc.)
 * 3. Update event-transformer.service.ts to include the new event
 */
expressApp.post("/", async (req, res) => {
  try {
    const logs = req.body as RawLog[];
    console.log(`[${new Date().toISOString()}] Received ${logs.length} logs`);

    const events = getKuruEventsFromLogs(logs);
    console.log(`[${new Date().toISOString()}] Processing ${events.trade.length} trades`);

    // Broadcast events to connected WebSocket clients
    try {
      const eventWsStream = eventWsManager.getWsStream();
      eventWsStream.broadcastEvents(events);
      const clientCount = eventWsStream.getConnectedClientCount();
      if (clientCount > 0) {
        console.log(`[${new Date().toISOString()}] Events broadcast to ${clientCount} connected clients`);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error broadcasting events:`, error);
      // Continue processing even if broadcasting fails
    }

    if (events.trade.length > 0) {
      console.log(`[${new Date().toISOString()}] Upserting ${events.trade.length} trades`);
      await db.insert(trade)
        .values(events.trade)
        .onConflictDoUpdate({
          target: trade.id,
          set: {
            block_number: sql.raw(`excluded.${trade.block_number.name}`),
            transaction_hash: sql.raw(`excluded.${trade.transaction_hash.name}`),
            order_book_address: sql.raw(`excluded.${trade.order_book_address.name}`),
            order_id: sql.raw(`excluded.${trade.order_id.name}`),
            maker_address: sql.raw(`excluded.${trade.maker_address.name}`),
            is_buy: sql.raw(`excluded.${trade.is_buy.name}`),
            price: sql.raw(`excluded.${trade.price.name}`),
            updated_size: sql.raw(`excluded.${trade.updated_size.name}`),
            taker_address: sql.raw(`excluded.${trade.taker_address.name}`),
            tx_origin: sql.raw(`excluded.${trade.tx_origin.name}`),
            filled_size: sql.raw(`excluded.${trade.filled_size.name}`),
          }
        });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing request:`, error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
