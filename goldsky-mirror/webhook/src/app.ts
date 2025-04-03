import express from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { sql } from "drizzle-orm";
import {
  trade,
  orderCreated,
  ordersCanceled,
  initialized,
  ownershipHandoverCanceled,
  ownershipHandoverRequested,
  ownershipTransferred,
  upgraded,
} from "./db/schema";
import { RawLog } from "./types";
import { getKuruEventsFromLogs } from "./services/event-transformer.service";
import { EventWsStream } from "./services/event-ws-stream.service";

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
  res.status(200).send("Kuru Indexer Goldsky Mirror Webhook");
});

expressApp.post("/", async (req, res) => {
  try {
    const logs = req.body as RawLog[];
    console.log(`[${new Date().toISOString()}] Received ${logs.length} logs`);

    const events = getKuruEventsFromLogs(logs);
    console.log(`[${new Date().toISOString()}] Processing ${events.trade.length} trades, ${events.orderCreated.length} order creations, ${events.ordersCanceled.length} order cancellations, ${events.initialized.length} initializations, ${events.ownershipHandoverCanceled.length} ownership handover cancellations, ${events.ownershipHandoverRequested.length} ownership handover requests, ${events.ownershipTransferred.length} ownership transfers, ${events.upgraded.length} upgrades`);

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

    // Use a transaction for all table upserts
    await db.transaction(async (tx) => {
      if (events.trade.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.trade.length} trades`);
        await tx.insert(trade)
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

      if (events.orderCreated.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.orderCreated.length} order creations`);
        await tx.insert(orderCreated)
          .values(events.orderCreated)
          .onConflictDoUpdate({
            target: orderCreated.id,
            set: {
              block_number: sql.raw(`excluded.${orderCreated.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${orderCreated.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${orderCreated.order_book_address.name}`),
              order_id: sql.raw(`excluded.${orderCreated.order_id.name}`),
              owner: sql.raw(`excluded.${orderCreated.owner.name}`),
              size: sql.raw(`excluded.${orderCreated.size.name}`),
              price: sql.raw(`excluded.${orderCreated.price.name}`),
              is_buy: sql.raw(`excluded.${orderCreated.is_buy.name}`),
            }
          });
      }

      if (events.ordersCanceled.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.ordersCanceled.length} order cancellations`);
        await tx.insert(ordersCanceled)
          .values(events.ordersCanceled)
          .onConflictDoUpdate({
            target: ordersCanceled.id,
            set: {
              block_number: sql.raw(`excluded.${ordersCanceled.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${ordersCanceled.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${ordersCanceled.order_book_address.name}`),
              order_ids: sql.raw(`excluded.${ordersCanceled.order_ids.name}`),
              owner: sql.raw(`excluded.${ordersCanceled.owner.name}`)
            }
          });
      }

      if (events.initialized.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.initialized.length} initializations`);
        await tx.insert(initialized)
          .values(events.initialized)
          .onConflictDoUpdate({
            target: initialized.id,
            set: {
              block_number: sql.raw(`excluded.${initialized.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${initialized.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${initialized.order_book_address.name}`),
              version: sql.raw(`excluded.${initialized.version.name}`)
            }
          });
      }

      if (events.ownershipHandoverCanceled.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.ownershipHandoverCanceled.length} ownership handover cancellations`);
        await tx.insert(ownershipHandoverCanceled)
          .values(events.ownershipHandoverCanceled)
          .onConflictDoUpdate({
            target: ownershipHandoverCanceled.id,
            set: {
              block_number: sql.raw(`excluded.${ownershipHandoverCanceled.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${ownershipHandoverCanceled.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${ownershipHandoverCanceled.order_book_address.name}`),
              pending_owner: sql.raw(`excluded.${ownershipHandoverCanceled.pending_owner.name}`)
            }
          });
      }

      if (events.ownershipHandoverRequested.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.ownershipHandoverRequested.length} ownership handover requests`);
        await tx.insert(ownershipHandoverRequested)
          .values(events.ownershipHandoverRequested)
          .onConflictDoUpdate({
            target: ownershipHandoverRequested.id,
            set: {
              block_number: sql.raw(`excluded.${ownershipHandoverRequested.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${ownershipHandoverRequested.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${ownershipHandoverRequested.order_book_address.name}`),
              pending_owner: sql.raw(`excluded.${ownershipHandoverRequested.pending_owner.name}`)
            }
          });
      }

      if (events.ownershipTransferred.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.ownershipTransferred.length} ownership transfers`);
        await tx.insert(ownershipTransferred)
          .values(events.ownershipTransferred)
          .onConflictDoUpdate({
            target: ownershipTransferred.id,
            set: {
              block_number: sql.raw(`excluded.${ownershipTransferred.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${ownershipTransferred.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${ownershipTransferred.order_book_address.name}`),
              old_owner: sql.raw(`excluded.${ownershipTransferred.old_owner.name}`),
              new_owner: sql.raw(`excluded.${ownershipTransferred.new_owner.name}`)
            }
          });
      }

      if (events.upgraded.length > 0) {
        console.log(`[${new Date().toISOString()}] Upserting ${events.upgraded.length} upgrades`);
        await tx.insert(upgraded)
          .values(events.upgraded)
          .onConflictDoUpdate({
            target: upgraded.id,
            set: {
              block_number: sql.raw(`excluded.${upgraded.block_number.name}`),
              transaction_hash: sql.raw(`excluded.${upgraded.transaction_hash.name}`),
              order_book_address: sql.raw(`excluded.${upgraded.order_book_address.name}`),
              implementation: sql.raw(`excluded.${upgraded.implementation.name}`)
            }
          });
      }
    });

    res.status(200).json(events);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing request:`, error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
