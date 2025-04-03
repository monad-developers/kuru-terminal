import { db } from "../db/drizzle";
import { EventQueryParams, KuruEvents } from "../types";
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
import { asc, desc } from "drizzle-orm";
import { createLogger } from "../utils/logger.util";

// Create logger for this module
const logger = createLogger('EventRepository');

// Default limit for queries
const DEFAULT_LIMIT = 20;

// Get the appropriate table for a given event type
function getTableForEventType(eventType: KuruEvents) {
  switch (eventType) {
    case KuruEvents.TRADE:
      return trade;
    case KuruEvents.ORDER_CREATED:
      return orderCreated;
    case KuruEvents.ORDERS_CANCELED:
      return ordersCanceled;
    case KuruEvents.INITIALIZED:
      return initialized;
    case KuruEvents.OWNERSHIP_HANDOVER_CANCELED:
      return ownershipHandoverCanceled;
    case KuruEvents.OWNERSHIP_HANDOVER_REQUESTED:
      return ownershipHandoverRequested;
    case KuruEvents.OWNERSHIP_TRANSFERRED:
      return ownershipTransferred;
    case KuruEvents.UPGRADED:
      return upgraded;
    default:
      logger.error(`Invalid event type: ${eventType}`);
      throw new Error(`Invalid event type: ${eventType}`);
  }
}

// Safely get the column reference from a table based on column name
function getSafeColumnRef(table: any, columnName: string) {
  // Always allow block_number as it exists on all tables
  if (columnName === 'block_number') {
    return table.block_number;
  }
  
  // Check if the column exists on the table
  if (table[columnName] !== undefined) {
    return table[columnName];
  }
  
  // Default to block_number if column doesn't exist
  logger.warn(`Column "${columnName}" does not exist on table. Defaulting to block_number.`);
  return table.block_number;
}

// Get all events for a specific event type
export async function getEvents(params: EventQueryParams) {
  try {
    const { eventType, sortBy = 'block_number', sortOrder = 'desc', limit = DEFAULT_LIMIT } = params;
    
    logger.info(`Fetching ${eventType} events (limit: ${limit}, sort: ${sortBy} ${sortOrder})`);
    
    // Get the table for the event type
    const table = getTableForEventType(eventType);
    
    // Get a reference to the column we want to sort by
    const sortColumn = getSafeColumnRef(table, sortBy);
    logger.debug(`Using sort column: ${sortBy}`);
    
    // Apply sorting based on sortOrder
    const startTime = Date.now();
    const events = await db
      .select()
      .from(table)
      .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
      .limit(limit);
    const queryTime = Date.now() - startTime;
    
    logger.info(`Retrieved ${events.length} ${eventType} events in ${queryTime}ms`);
    
    return {
      data: events,
      meta: {
        limit,
        query_time_ms: queryTime
      },
    };
  } catch (error) {
    logger.error(`Error getting events for ${params.eventType}:`, error);
    throw error;
  }
} 