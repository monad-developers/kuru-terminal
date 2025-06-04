import { db } from '../db/drizzle';
import { trade } from '../db/schema';
import { Trade } from '../db/types';
import { ProcessedEvent } from '../types';

export type TradeEventForDb = Omit<Trade, 'id'>;

/**
 * Database service for handling trade event persistence
 */
export class DbService {
    /**
     * Converts a ProcessedEvent to the format expected by the database
     * @param event - The processed event from Kafka stream
     * @returns Formatted trade event for database insertion
     */
    private static formatTradeEventForDB(event: ProcessedEvent): TradeEventForDb {
        if (event.type !== 'Trade') {
            throw new Error(`Unsupported event type: ${event.type}`);
        }

        return {
            transactionHash: event.transactionHash,
            blockHeight: event.blockNumber.toString(),
            orderBookAddress: event.data.orderBookAddress,
            orderId: event.data.orderId,
            txOrigin: event.data.txOrigin,
            makerAddress: event.data.makerAddress,
            takerAddress: event.data.takerAddress,
            isBuy: event.data.isBuy,
            price: event.data.price,
            updatedSize: event.data.updatedSize,
            filledSize: event.data.filledSize,
        };
    }

    /**
     * Saves a single trade event to the database
     * @param event - The processed event to save
     */
    public static async saveTradeEvent(event: ProcessedEvent): Promise<void> {
        try {
            if (event.type !== 'Trade') {
                console.warn(`Skipping non-Trade event: ${event.type}`);
                return;
            }

            const tradeEventForDB = this.formatTradeEventForDB(event);

            await db.insert(trade).values(tradeEventForDB);

            console.log(`[${new Date().toISOString()}] Trade event saved to database: orderId=${tradeEventForDB.orderId}, block=${tradeEventForDB.blockHeight}`);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error saving trade event to database:`, error);
            throw error;
        }
    }
} 