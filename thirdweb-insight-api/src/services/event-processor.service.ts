import { db } from "../db/drizzle";
import { sql } from "drizzle-orm";
import { RawLog } from "../types";
import {
  trade,
} from "../db/schema";
import { KURU_TRADE_EVENT_TOPIC } from "../constants";
import { TradeEvent } from "../db/types";
import { createLogger } from "../utils/logger.util";
import { ethers } from "ethers";
import kuruOrderBookAbi from "../abis/KuruOrderBook.json";
import { EventWsStream } from "./event-ws-stream.service";

/**
 * EventProcessor class responsible for processing blockchain events.
 * Core responsibilities:
 * 1. Decoding raw blockchain events into typed trade events
 * 2. Broadcasting events in real-time via WebSocket to connected clients
 * 3. Persisting events to the database for data consistency
 */
export class EventProcessor {
  private readonly logger = createLogger('EventProcessor');
  private readonly contractInterface: ethers.Interface;
  private readonly wsServer: EventWsStream;

  constructor() {
    this.logger.info('Initializing EventProcessor');
    this.contractInterface = new ethers.Interface(kuruOrderBookAbi);
    this.wsServer = new EventWsStream();
  }

  /**
   * Process a batch of raw blockchain events.
   * Filters for trade events, decodes them, broadcasts via WebSocket, and stores in database.
   * @param events Array of raw blockchain events to process
   */
  public async processEvents(events: RawLog[]): Promise<void> {
    try {
      this.logger.info(`Starting processing of ${events.length} events`);

      // Filter for trade events
      // Note: This can be extended to filter for other events as needed
      const rawTradeEvents = events.filter(event => event.topics[0].toLowerCase() === KURU_TRADE_EVENT_TOPIC);

      await this.processTrades(rawTradeEvents);

      this.logger.info(`Successfully processed all trade events`);
    } catch (error) {
      this.logger.error("Error processing events:", error);
      throw error;
    }
  }

  /**
   * Process trade events by:
   * 1. Decoding raw event data into typed TradeEvents
   * 2. Broadcasting events to WebSocket clients in real-time
   * 3. Persisting events to database with conflict resolution
   * @param rawTradeEvents Array of raw trade events to process
   */
  private async processTrades(rawTradeEvents: RawLog[]): Promise<void> {
    try {
      this.logger.info(`Processing ${rawTradeEvents.length} trade events`);

      const decodedTradeEvents: TradeEvent[] = [];
      for (const event of rawTradeEvents) {
        const decodedEvent = this.decodeTradeEventData(event);
        if (decodedEvent) {
          decodedTradeEvents.push(decodedEvent);
        }
      }

      if (decodedTradeEvents.length > 0) {
        // Broadcast events via WebSocket to connected clients
        this.wsServer.broadcastTradeEvents(decodedTradeEvents);

        // Store events in database
        await this.storeTradesInDb(decodedTradeEvents);
      }
    } catch (error) {
      this.logger.error(`Error processing trade events:`, error);
      throw error;
    }
  }

  /**
   * Decodes raw blockchain event data into typed TradeEvent format.
   * Uses ethers.js to decode event parameters according to the contract ABI.
   * @param log Raw blockchain event log
   * @returns Decoded TradeEvent or null if decoding fails
   */
  private decodeTradeEventData(log: RawLog): TradeEvent | null {
    try {
      const [orderId, makerAddress, isBuy, price, updatedSize, takerAddress, txOrigin, filledSize] = this.contractInterface.decodeEventLog("Trade", log.data, log.topics);

      return {
        block_number: log.block_number,
        transaction_hash: log.transaction_hash,
        order_book_address: log.address,
        log_index: log.log_index,
        order_id: orderId.toString(),
        maker_address: makerAddress,
        is_buy: isBuy,
        price: price.toString(),
        updated_size: updatedSize.toString(),
        taker_address: takerAddress,
        tx_origin: txOrigin,
        filled_size: filledSize.toString(),
      } as TradeEvent;

    } catch (error) {
      this.logger.error(`Error decoding event: ${error}`);
      return null;
    }
  }

  /**
   * Stores trade events in the database with conflict resolution.
   * Uses an UPSERT operation to handle duplicate events based on transaction_hash and log_index.
   * @param tradeEvents Array of trade events to store
   */
  private async storeTradesInDb(tradeEvents: TradeEvent[]): Promise<void> {
    this.logger.debug(`Inserting ${tradeEvents.length} trade events`);

    await db.insert(trade).values(tradeEvents).onConflictDoUpdate({
      target: [trade.transaction_hash, trade.log_index],
      set: {
        block_number: sql.raw(`excluded.${trade.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${trade.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${trade.order_book_address.name}`),
        log_index: sql.raw(`excluded.${trade.log_index.name}`),
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

    this.logger.info(`Successfully stored ${tradeEvents.length} trade events`);
  }

  /**
   * Gracefully shuts down the EventProcessor.
   * Closes WebSocket server connections and performs cleanup.
   */
  public shutdown(): void {
    this.logger.info('Shutting down EventProcessor');
    this.wsServer.shutdown();
  }
} 