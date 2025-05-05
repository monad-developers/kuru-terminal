import { ethers } from "ethers";
import { KuruEvents, RawLog } from "../types";
import kuruOrderBookABI from "../abis/KuruOrderBook.json";
import {
  TradeEvent
} from "../db/types";

/**
 * Contract interface and event topics for KuruOrderBook events
 * Currently only handling Trade events
 * 
 * Note: To add support for more events:
 * 1. Add event topic hash to eventTopics
 * 2. Add event decoding logic in decodeEventData
 * 3. Update KuruEvents interface in types.ts
 */
const contractInterface = new ethers.Interface(kuruOrderBookABI);
export const eventTopics = {
  trade: contractInterface.getEvent("Trade")?.topicHash.toLowerCase(),
};

/**
 * Deduplicates logs based on their ID, keeping the most recent occurrence of each log.
 * 
 * During chain reorganizations:
 * 1. Mirror streams events in chronological order within batches [older,...,latest]
 * 2. For duplicate log IDs, the latest occurrence (highest index) represents the most up-to-date state
 * 3. This approach handles reorgs properly as Mirror ensures the final state is streamed last
 * 
 * @param logs Array of logs to deduplicate
 * @returns Array of deduplicated logs with the latest state for each log ID
 */
export function deduplicateLogs(logs: RawLog[]): RawLog[] {
  if (logs.length <= 1) return logs;

  console.log(`[${new Date().toISOString()}] Starting deduplication of ${logs.length} logs`);

  // Process logs in reverse order (from latest to oldest)
  // First occurrence we see of each ID is its latest state
  const deduplicatedLogs = new Map<string, RawLog>();
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];

    if (!deduplicatedLogs.has(log.id)) {
      deduplicatedLogs.set(log.id, log);
    } else {
      const latestLog = deduplicatedLogs.get(log.id);
      console.log(`[${new Date().toISOString()}] Duplicate log found (keeping newer version):
      ID: ${log.id}
      Older version at block: ${log.block_number}
      Older version block timestamp: ${log.block_timestamp}
      Older version transaction hash: ${log.transaction_hash}
      Newer version at block: ${latestLog?.block_number}
      Newer version block timestamp: ${latestLog?.block_timestamp}
      Newer version transaction hash: ${latestLog?.transaction_hash}`);
    }
  }

  const result = Array.from(deduplicatedLogs.values());
  const duplicateCount = logs.length - result.length;
  console.log(`[${new Date().toISOString()}] Deduplication complete. Removed ${duplicateCount} duplicates from ${logs.length} logs`);

  return result;
}

/**
 * Decodes raw log data into typed event data
 * Currently only decodes Trade events
 * 
 * Note: To add support for more events:
 * 1. Add new case in switch statement with decoding logic
 * 2. Update return type to include new event type
 */
export function decodeEventData(log: RawLog): TradeEvent | null {
  const topics = log.topics.split(",");
  const eventTopic = topics[0].toLowerCase();

  try {
    const baseEvent = {
      id: log.id,
      block_number: log.block_number,
      transaction_hash: log.transaction_hash,
      order_book_address: log.address,
    };

    switch (eventTopic) {
      case eventTopics.trade: {
        const [orderId, makerAddress, isBuy, price, updatedSize, takerAddress, txOrigin, filledSize] =
          contractInterface.decodeEventLog("Trade", log.data, topics);
        return {
          ...baseEvent,
          order_id: orderId.toString(),
          maker_address: makerAddress,
          is_buy: isBuy,
          price: price.toString(),
          updated_size: updatedSize.toString(),
          taker_address: takerAddress,
          tx_origin: txOrigin,
          filled_size: filledSize.toString(),
        } as TradeEvent;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error decoding event: ${error}`);
    return null;
  }
}

/**
 * Processes raw logs into typed KuruEvents
 * Currently only processes Trade events
 * 
 * Note: To add support for more events:
 * 1. Add new event array to KuruEvents interface
 * 2. Add case in switch statement to handle new event type
 */
export function getKuruEventsFromLogs(logs: RawLog[]): KuruEvents {
  const kuruEvents: KuruEvents = {
    trade: [],
  };

  const deduplicatedLogs = deduplicateLogs(logs);

  for (const log of deduplicatedLogs) {
    if (!log.topics || !log.data) continue;

    const eventTopic = log.topics.split(",")[0].toLowerCase();
    const decodedEvent = decodeEventData(log);

    if (!decodedEvent) continue;

    switch (eventTopic) {
      case eventTopics.trade:
        kuruEvents.trade.push(decodedEvent as TradeEvent);
        break;
    }
  }

  return kuruEvents;
} 