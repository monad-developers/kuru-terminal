import { db } from "../db/drizzle";
import { sql } from "drizzle-orm";
import { RawLog, KuruEvents, PgTransaction } from "../types";
import {
  trade,
  orderCreated,
  ordersCanceled,
  initialized,
  ownershipHandoverCanceled,
  ownershipHandoverRequested,
  ownershipTransferred,
  upgraded,
} from "../db/schema";
import { kuruEventTopics } from "../constants";
import { InitializedEvent, KuruEvent, OrderCreatedEvent, OrdersCanceledEvent, OwnershipHandoverCanceledEvent, OwnershipHandoverRequestedEvent, OwnershipTransferredEvent, TradeEvent, UpgradedEvent } from "../db/types";
import { createLogger } from "../utils/logger.util";
import { ethers } from "ethers";
import kuruOrderBookAbi from "../abis/KuruOrderBook.json";

// Create logger for this module
const logger = createLogger('EventProcessor');

// Create contract interface for decoding
const contractInterface = new ethers.Interface(kuruOrderBookAbi);

/**
 * Decodes event data from raw logs using ethers and the contract ABI
 * @param log Raw event log from the API
 * @returns Decoded event data or null if decoding fails
 */
function decodeEventData(log: RawLog): KuruEvent | null {
  const eventTopic = log.topics[0].toLowerCase();

  try {
    const baseEvent = {
      block_number: log.block_number,
      transaction_hash: log.transaction_hash,
      order_book_address: log.address,
    };

    switch (eventTopic) {
      case kuruEventTopics.trade: {
        const [orderId, makerAddress, isBuy, price, updatedSize, takerAddress, txOrigin, filledSize] =
          contractInterface.decodeEventLog("Trade", log.data, log.topics);
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
      case kuruEventTopics.orderCreated: {
        const [orderId, owner, size, price, isBuy] =
          contractInterface.decodeEventLog("OrderCreated", log.data, log.topics);
        return {
          ...baseEvent,
          order_id: orderId.toString(),
          owner,
          size: size.toString(),
          price: price.toString(),
          is_buy: isBuy,
        } as OrderCreatedEvent;
      }
      case kuruEventTopics.ordersCanceled: {
        const [orderIds, owner] =
          contractInterface.decodeEventLog("OrdersCanceled", log.data, log.topics);
        return {
          ...baseEvent,
          order_ids: JSON.stringify(orderIds.map((id: bigint) => id.toString())),
          owner,
        } as OrdersCanceledEvent;
      }
      case kuruEventTopics.initialized: {
        const [version] = contractInterface.decodeEventLog("Initialized", log.data, log.topics);
        return {
          ...baseEvent,
          version: version.toString(),
        } as InitializedEvent;
      }
      case kuruEventTopics.ownershipHandoverCanceled: {
        const [pendingOwner] =
          contractInterface.decodeEventLog("OwnershipHandoverCanceled", log.data, log.topics);
        return {
          ...baseEvent,
          pending_owner: pendingOwner,
        } as OwnershipHandoverCanceledEvent;
      }
      case kuruEventTopics.ownershipHandoverRequested: {
        const [pendingOwner] =
          contractInterface.decodeEventLog("OwnershipHandoverRequested", log.data, log.topics);
        return {
          ...baseEvent,
          pending_owner: pendingOwner,
        } as OwnershipHandoverRequestedEvent;
      }
      case kuruEventTopics.ownershipTransferred: {
        const [oldOwner, newOwner] =
          contractInterface.decodeEventLog("OwnershipTransferred", log.data, log.topics);
        return {
          ...baseEvent,
          old_owner: oldOwner,
          new_owner: newOwner,
        } as OwnershipTransferredEvent;
      }
      case kuruEventTopics.upgraded: {
        const [implementation] = contractInterface.decodeEventLog("Upgraded", log.data, log.topics);
        return {
          ...baseEvent,
          implementation,
        } as UpgradedEvent;
      }
      default:
        return null;
    }
  } catch (error) {
    logger.error(`Error decoding event: ${error}`);
    return null;
  }
}

// Process a batch of events and store them in the database
export async function processEvents(events: RawLog[]): Promise<void> {
  try {
    logger.info(`Starting processing of ${events.length} events`);

    // Group events by type
    const eventsByType = events.reduce((acc, event) => {
      const topicHash = event.topics[0].toLowerCase();
      const eventType = Object.entries(kuruEventTopics).find(([_, hash]) => hash === topicHash)?.[0];

      if (eventType) {
        if (!acc[eventType]) {
          acc[eventType] = [];
        }
        acc[eventType].push(event);
      }

      return acc;
    }, {} as Record<string, RawLog[]>);

    const eventTypes = Object.keys(eventsByType);
    const eventCounts = eventTypes.map(type => `${type}=${eventsByType[type].length}`).join(', ');
    logger.info(`Grouped events by type: ${eventCounts}`);

    // Process each type of event in a DB transaction
    await db.transaction(async (tx) => {
      logger.debug(`Started database transaction for event processing`);
      for (const [eventType, eventList] of Object.entries(eventsByType)) {
        await processEventsByType(tx, eventType as KuruEvents, eventList);
      }
      logger.debug(`Database transaction completed successfully`);
    });

    logger.info(`Successfully processed all events by type: ${Object.keys(eventsByType).join(", ")}`);
  } catch (error) {
    logger.error("Error processing events:", error);
    throw error;
  }
}

// Process events by their type
async function processEventsByType(tx: PgTransaction, eventType: KuruEvents, events: RawLog[]): Promise<void> {
  try {
    logger.info(`Processing ${events.length} events of type '${eventType}'`);

    switch (eventType) {
      case KuruEvents.TRADE:
        await processTrades(tx, events);
        break;
      case KuruEvents.ORDER_CREATED:
        await processOrderCreated(tx, events);
        break;
      case KuruEvents.ORDERS_CANCELED:
        await processOrdersCanceled(tx, events);
        break;
      case KuruEvents.INITIALIZED:
        await processInitialized(tx, events);
        break;
      case KuruEvents.OWNERSHIP_HANDOVER_CANCELED:
        await processOwnershipHandoverCanceled(tx, events);
        break;
      case KuruEvents.OWNERSHIP_HANDOVER_REQUESTED:
        await processOwnershipHandoverRequested(tx, events);
        break;
      case KuruEvents.OWNERSHIP_TRANSFERRED:
        await processOwnershipTransferred(tx, events);
        break;
      case KuruEvents.UPGRADED:
        await processUpgraded(tx, events);
        break;
      default:
        logger.warn(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    logger.error(`Error processing events of type ${eventType}:`, error);
    throw error;
  }
}

// Process Trade events
async function processTrades(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const tradeEvents: TradeEvent[] = [];

  for (const event of events) {
    const decodedTradeEvent = decodeEventData(event) as TradeEvent | null;
    if (!decodedTradeEvent) {
      logger.warn("Error decoding Trade event:", event, "Skipping...");
      continue;
    }
    tradeEvents.push(decodedTradeEvent);
  }

  if (tradeEvents.length > 0) {
    logger.debug(`Inserting ${tradeEvents.length} trade events`);
    await tx.insert(trade).values(tradeEvents).onConflictDoUpdate({
      target: [trade.transaction_hash, trade.order_book_address],
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
    logger.info(`Successfully stored ${tradeEvents.length} trade events`);
  }
}

// Process OrderCreated events
async function processOrderCreated(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const orderCreatedEvents: OrderCreatedEvent[] = [];

  for (const event of events) {
    const decodedOrderCreatedEvent = decodeEventData(event) as OrderCreatedEvent | null;
    if (!decodedOrderCreatedEvent) {
      logger.warn("Error decoding OrderCreated event:", event, "Skipping...");
      continue;
    }

    orderCreatedEvents.push(decodedOrderCreatedEvent);
  }

  if (orderCreatedEvents.length > 0) {
    logger.debug(`Inserting ${orderCreatedEvents.length} orderCreated events`);
    await tx.insert(orderCreated).values(orderCreatedEvents).onConflictDoUpdate({
      target: [orderCreated.transaction_hash, orderCreated.order_book_address],
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
    logger.info(`Successfully stored ${orderCreatedEvents.length} orderCreated events`);
  }
}

// Process OrdersCanceled events
async function processOrdersCanceled(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const ordersCanceledEvents: OrdersCanceledEvent[] = [];

  for (const event of events) {
    const decodedOrdersCanceledEvent = decodeEventData(event) as OrdersCanceledEvent | null;
    if (!decodedOrdersCanceledEvent) {
      logger.warn("Error decoding OrdersCanceled event:", event, "Skipping...");
      continue;
    }

    ordersCanceledEvents.push(decodedOrdersCanceledEvent);
  }

  if (ordersCanceledEvents.length > 0) {
    logger.debug(`Inserting ${ordersCanceledEvents.length} ordersCanceled events`);
    await tx.insert(ordersCanceled).values(ordersCanceledEvents).onConflictDoUpdate({
      target: [ordersCanceled.transaction_hash, ordersCanceled.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${ordersCanceled.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${ordersCanceled.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${ordersCanceled.order_book_address.name}`),
        order_ids: sql.raw(`excluded.${ordersCanceled.order_ids.name}`),
        owner: sql.raw(`excluded.${ordersCanceled.owner.name}`)
      }
    });
    logger.info(`Successfully stored ${ordersCanceledEvents.length} ordersCanceled events`);
  }
}

// Process Initialized events
async function processInitialized(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const initializedEvents: InitializedEvent[] = [];

  for (const event of events) {
    const decodedInitializedEvent = decodeEventData(event) as InitializedEvent | null;
    if (!decodedInitializedEvent) {
      logger.warn("Error decoding Initialized event:", event, "Skipping...");
      continue;
    }

    initializedEvents.push(decodedInitializedEvent);
  }

  if (initializedEvents.length > 0) {
    logger.debug(`Inserting ${initializedEvents.length} initialized events`);
    await tx.insert(initialized).values(initializedEvents).onConflictDoUpdate({
      target: [initialized.transaction_hash, initialized.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${initialized.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${initialized.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${initialized.order_book_address.name}`),
        version: sql.raw(`excluded.${initialized.version.name}`)
      }
    });
    logger.info(`Successfully stored ${initializedEvents.length} initialized events`);
  }
}

// Process OwnershipHandoverCanceled events
async function processOwnershipHandoverCanceled(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const ownershipHandoverCanceledEvents: OwnershipHandoverCanceledEvent[] = [];

  for (const event of events) {
    const decodedOwnershipHandoverCanceledEvent = decodeEventData(event) as OwnershipHandoverCanceledEvent | null;
    if (!decodedOwnershipHandoverCanceledEvent) {
      logger.warn("Error decoding OwnershipHandoverCanceled event:", event, "Skipping...");
      continue;
    }

    ownershipHandoverCanceledEvents.push(decodedOwnershipHandoverCanceledEvent);
  }

  if (ownershipHandoverCanceledEvents.length > 0) {
    logger.debug(`Inserting ${ownershipHandoverCanceledEvents.length} ownershipHandoverCanceled events`);
    await tx.insert(ownershipHandoverCanceled).values(ownershipHandoverCanceledEvents).onConflictDoUpdate({
      target: [ownershipHandoverCanceled.transaction_hash, ownershipHandoverCanceled.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${ownershipHandoverCanceled.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${ownershipHandoverCanceled.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${ownershipHandoverCanceled.order_book_address.name}`),
        pending_owner: sql.raw(`excluded.${ownershipHandoverCanceled.pending_owner.name}`)
      }
    });
    logger.info(`Successfully stored ${ownershipHandoverCanceledEvents.length} ownershipHandoverCanceled events`);
  }
}

// Process OwnershipHandoverRequested events
async function processOwnershipHandoverRequested(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const ownershipHandoverRequestedEvents: OwnershipHandoverRequestedEvent[] = [];

  for (const event of events) {
    const decodedOwnershipHandoverRequestedEvent = decodeEventData(event) as OwnershipHandoverRequestedEvent | null;
    if (!decodedOwnershipHandoverRequestedEvent) {
      logger.warn("Error decoding OwnershipHandoverRequested event:", event, "Skipping...");
      continue;
    }

    ownershipHandoverRequestedEvents.push(decodedOwnershipHandoverRequestedEvent);
  }

  if (ownershipHandoverRequestedEvents.length > 0) {
    logger.debug(`Inserting ${ownershipHandoverRequestedEvents.length} ownershipHandoverRequested events`);
    await tx.insert(ownershipHandoverRequested).values(ownershipHandoverRequestedEvents).onConflictDoUpdate({
      target: [ownershipHandoverRequested.transaction_hash, ownershipHandoverRequested.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${ownershipHandoverRequested.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${ownershipHandoverRequested.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${ownershipHandoverRequested.order_book_address.name}`),
        pending_owner: sql.raw(`excluded.${ownershipHandoverRequested.pending_owner.name}`)
      }
    });
    logger.info(`Successfully stored ${ownershipHandoverRequestedEvents.length} ownershipHandoverRequested events`);
  }
}

// Process OwnershipTransferred events
async function processOwnershipTransferred(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const ownershipTransferredEvents: OwnershipTransferredEvent[] = [];

  for (const event of events) {
    const decodedOwnershipTransferredEvent = decodeEventData(event) as OwnershipTransferredEvent | null;
    if (!decodedOwnershipTransferredEvent) {
      logger.warn("Error decoding OwnershipTransferred event:", event, "Skipping...");
      continue;
    }

    ownershipTransferredEvents.push(decodedOwnershipTransferredEvent);
  }

  if (ownershipTransferredEvents.length > 0) {
    logger.debug(`Inserting ${ownershipTransferredEvents.length} ownershipTransferred events`);
    await tx.insert(ownershipTransferred).values(ownershipTransferredEvents).onConflictDoUpdate({
      target: [ownershipTransferred.transaction_hash, ownershipTransferred.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${ownershipTransferred.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${ownershipTransferred.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${ownershipTransferred.order_book_address.name}`),
        old_owner: sql.raw(`excluded.${ownershipTransferred.old_owner.name}`),
        new_owner: sql.raw(`excluded.${ownershipTransferred.new_owner.name}`)
      }
    });
    logger.info(`Successfully stored ${ownershipTransferredEvents.length} ownershipTransferred events`);
  }
}

// Process Upgraded events
async function processUpgraded(tx: PgTransaction, events: RawLog[]): Promise<void> {
  const upgradedEvents: UpgradedEvent[] = [];

  for (const event of events) {
    const decodedUpgradedEvent = decodeEventData(event) as UpgradedEvent | null;
    if (!decodedUpgradedEvent) {
      logger.warn("Error decoding Upgraded event:", event, "Skipping...");
      continue;
    }

    upgradedEvents.push(decodedUpgradedEvent);
  }

  if (upgradedEvents.length > 0) {
    logger.debug(`Inserting ${upgradedEvents.length} upgraded events`);
    await tx.insert(upgraded).values(upgradedEvents).onConflictDoUpdate({
      target: [upgraded.transaction_hash, upgraded.order_book_address],
      set: {
        block_number: sql.raw(`excluded.${upgraded.block_number.name}`),
        transaction_hash: sql.raw(`excluded.${upgraded.transaction_hash.name}`),
        order_book_address: sql.raw(`excluded.${upgraded.order_book_address.name}`),
        implementation: sql.raw(`excluded.${upgraded.implementation.name}`)
      }
    });
    logger.info(`Successfully stored ${upgradedEvents.length} upgraded events`);
  }
} 