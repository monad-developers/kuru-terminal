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

// Indexer types

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
