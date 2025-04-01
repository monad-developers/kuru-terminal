import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction as PgTransactionType } from "drizzle-orm/pg-core";
import { NeonQueryResultHKT } from "drizzle-orm/neon-serverless";

// Common types

export type PgTransaction = PgTransactionType<NeonQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>

// thirdweb Insight API types

export interface RawLog {
  chain_id: string;
  block_number: number;
  block_hash: string;
  block_timestamp: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  data: string;
  topics: string[];
}

export interface InsightAPIResponse {
  data: RawLog[];
  meta: {
    address: string;
    page: number;
    total_items: number;
    limit_per_chain: number;
    chain_ids: number[];
  };
}

// Indexer API types

export interface EventQueryParams {
  eventType: KuruEvents;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export enum KuruEvents {
  TRADE = 'trade',
  ORDER_CREATED = 'orderCreated',
  ORDERS_CANCELED = 'ordersCanceled',
  INITIALIZED = 'initialized',
  OWNERSHIP_HANDOVER_CANCELED = 'ownershipHandoverCanceled',
  OWNERSHIP_HANDOVER_REQUESTED = 'ownershipHandoverRequested',
  OWNERSHIP_TRANSFERRED = 'ownershipTransferred',
  UPGRADED = 'upgraded'
}

export interface BlockTracker {
  lastIndexedBlock: number;
  lastUpdated: Date;
}

export interface TradingPair {
  name: string;
  address: string;
  startBlock: number;
}

export interface TradingPairsConfig {
  tradingPairs: TradingPair[];
}
