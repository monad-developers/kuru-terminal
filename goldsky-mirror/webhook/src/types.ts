import {
  TradeEvent
} from "./db/types";

/**
 * Raw log type from Goldsky Mirror Pipeline
 */
export interface RawLog {
  id: string;
  block_number: number;
  block_hash: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  data: string;
  topics: string;
  block_timestamp: number;
}

/**
 * Grouped event data from KuruOrderBook contract
 * Currently only includes Trade events
 * 
 * Note: To add support for more events:
 * 1. Import new event type from db/types
 * 2. Add new event array to this interface
 * 3. Update event-transformer.service.ts to handle the new event type
 */
export interface KuruEvents {
  trade: TradeEvent[];
}
