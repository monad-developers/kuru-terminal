import { ethers } from "ethers";
import { KuruEvents, RawLog } from "./types";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";
import {
  TradeEvent,
  OrderCreatedEvent,
  OrdersCanceledEvent,
  InitializedEvent,
  OwnershipHandoverCanceledEvent,
  OwnershipHandoverRequestedEvent,
  OwnershipTransferredEvent,
  UpgradedEvent,
} from "./db/types";

// Create contract interface for event parsing
const contractInterface = new ethers.Interface(kuruOrderBookABI);

// Get event topic hashes
export const eventTopics = {
  trade: contractInterface.getEvent("Trade")?.topicHash.toLowerCase(),
  orderCreated: contractInterface.getEvent("OrderCreated")?.topicHash.toLowerCase(),
  ordersCanceled: contractInterface.getEvent("OrdersCanceled")?.topicHash.toLowerCase(),
  initialized: contractInterface.getEvent("Initialized")?.topicHash.toLowerCase(),
  ownershipHandoverCanceled: contractInterface.getEvent("OwnershipHandoverCanceled")?.topicHash.toLowerCase(),
  ownershipHandoverRequested: contractInterface.getEvent("OwnershipHandoverRequested")?.topicHash.toLowerCase(),
  ownershipTransferred: contractInterface.getEvent("OwnershipTransferred")?.topicHash.toLowerCase(),
  upgraded: contractInterface.getEvent("Upgraded")?.topicHash.toLowerCase(),
};

/**
 * Deduplicates logs based on their ID, using block timestamp as primary sort criteria
 * and maintaining Goldsky's log order as secondary criteria.
 * 
 * During chain reorganizations:
 * 1. Logs with more recent timestamps are considered canonical
 * 2. For same timestamp (shouldn't happen in reorgs), maintains Goldsky's order
 * 3. Goldsky handles chain continuity by validating block hash chains
 * 
 * @param logs Array of logs to deduplicate
 * @returns Array of deduplicated logs, keeping the most recent version of each log
 */
export function deduplicateLogs(logs: RawLog[]): RawLog[] {
  if (logs.length <= 1) return logs;

  console.log(`[${new Date().toISOString()}] Starting deduplication of ${logs.length} logs`);

  // Sort by timestamp (descending) and maintain original order for same timestamp
  const sortedLogs = [...logs].sort((a, b) => {
    const aTime = a.block_timestamp ?? 0;
    const bTime = b.block_timestamp ?? 0;

    if (aTime !== bTime) {
      // Different timestamps - use the more recent one
      return bTime - aTime;
    }

    // Same timestamp - trust Goldsky's order as they validate chain continuity
    return logs.indexOf(b) - logs.indexOf(a);
  });

  // Keep only the first occurrence of log (most recent due to sorting)
  const deduplicatedLogs = new Map<string, RawLog>();
  for (const log of sortedLogs) {
    if (!deduplicatedLogs.has(log.id)) {
      deduplicatedLogs.set(log.id, log);
    } else {
      const deduplicatedLog = deduplicatedLogs.get(log.id);
      console.log(`[${new Date().toISOString()}] Duplicate log found:
      Current log:
        ID: ${log.id}
        Address: ${log.address}
        Block Number: ${log.block_number}
        Block Timestamp: ${log.block_timestamp}
        Tx Hash: ${log.transaction_hash}

      Existing log with same ID:
        ID: ${deduplicatedLog?.id}
        Address: ${deduplicatedLog?.address}
        Block Number: ${deduplicatedLog?.block_number}
        Block Timestamp: ${deduplicatedLog?.block_timestamp}
        Tx Hash: ${deduplicatedLog?.transaction_hash}

      Block difference: ${Math.abs(log.block_number - (deduplicatedLog?.block_number || 0))} blocks`);
    }
  }

  const result = Array.from(deduplicatedLogs.values());
  const duplicateCount = logs.length - result.length;
  console.log(`[${new Date().toISOString()}] Deduplication complete. Removed ${duplicateCount} duplicates from ${logs.length} logs`);

  return result;
}

// Helper function to decode event data
export function decodeEventData(log: RawLog) {
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
      case eventTopics.orderCreated: {
        const [orderId, owner, size, price, isBuy] =
          contractInterface.decodeEventLog("OrderCreated", log.data, topics);
        return {
          ...baseEvent,
          order_id: orderId.toString(),
          owner,
          size: size.toString(),
          price: price.toString(),
          is_buy: isBuy,
        } as OrderCreatedEvent;
      }
      case eventTopics.ordersCanceled: {
        const [orderIds, owner] =
          contractInterface.decodeEventLog("OrdersCanceled", log.data, topics);
        return {
          ...baseEvent,
          order_ids: JSON.stringify(orderIds.map((id: bigint) => id.toString())),
          owner,
        } as OrdersCanceledEvent;
      }
      case eventTopics.initialized: {
        const [version] = contractInterface.decodeEventLog("Initialized", log.data, topics);
        return {
          ...baseEvent,
          version: version.toString(),
        } as InitializedEvent;
      }
      case eventTopics.ownershipHandoverCanceled: {
        const [pendingOwner] =
          contractInterface.decodeEventLog("OwnershipHandoverCanceled", log.data, topics);
        return {
          ...baseEvent,
          pending_owner: pendingOwner,
        } as OwnershipHandoverCanceledEvent;
      }
      case eventTopics.ownershipHandoverRequested: {
        const [pendingOwner] =
          contractInterface.decodeEventLog("OwnershipHandoverRequested", log.data, topics);
        return {
          ...baseEvent,
          pending_owner: pendingOwner,
        } as OwnershipHandoverRequestedEvent;
      }
      case eventTopics.ownershipTransferred: {
        const [oldOwner, newOwner] =
          contractInterface.decodeEventLog("OwnershipTransferred", log.data, topics);
        return {
          ...baseEvent,
          old_owner: oldOwner,
          new_owner: newOwner,
        } as OwnershipTransferredEvent;
      }
      case eventTopics.upgraded: {
        const [implementation] = contractInterface.decodeEventLog("Upgraded", log.data, topics);
        return {
          ...baseEvent,
          implementation,
        } as UpgradedEvent;
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error decoding event: ${error}`);
    return null;
  }
}

// Helper function to filter and group events by type
export function processKuruEventsFromLogs(logs: RawLog[]): KuruEvents {
  const kuruEvents: KuruEvents = {
    trade: [],
    orderCreated: [],
    ordersCanceled: [],
    initialized: [],
    ownershipHandoverCanceled: [],
    ownershipHandoverRequested: [],
    ownershipTransferred: [],
    upgraded: [],
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
      case eventTopics.orderCreated:
        kuruEvents.orderCreated.push(decodedEvent as OrderCreatedEvent);
        break;
      case eventTopics.ordersCanceled:
        kuruEvents.ordersCanceled.push(decodedEvent as OrdersCanceledEvent);
        break;
      case eventTopics.initialized:
        kuruEvents.initialized.push(decodedEvent as InitializedEvent);
        break;
      case eventTopics.ownershipHandoverCanceled:
        kuruEvents.ownershipHandoverCanceled.push(decodedEvent as OwnershipHandoverCanceledEvent);
        break;
      case eventTopics.ownershipHandoverRequested:
        kuruEvents.ownershipHandoverRequested.push(decodedEvent as OwnershipHandoverRequestedEvent);
        break;
      case eventTopics.ownershipTransferred:
        kuruEvents.ownershipTransferred.push(decodedEvent as OwnershipTransferredEvent);
        break;
      case eventTopics.upgraded:
        kuruEvents.upgraded.push(decodedEvent as UpgradedEvent);
        break;
    }
  }

  return kuruEvents;
} 