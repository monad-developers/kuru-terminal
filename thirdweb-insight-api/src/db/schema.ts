import { pgTable, varchar, bigint, boolean, timestamp, uuid, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";

// Track the last indexed block per contract
export const contractBlockTracker = pgTable("contract_block_tracker", {
  chain_id: varchar("chain_id").notNull(),
  contract_address: varchar("contract_address").notNull(),
  last_indexed_block: bigint("last_indexed_block", { mode: "number" }).default(0),
  last_updated: timestamp("last_updated").defaultNow(),
  contract_name: varchar("contract_name"),
}, (table) => [primaryKey({ columns: [table.chain_id, table.contract_address] })]
);

// Common fields for all event tables
const commonFields = {
  id: uuid("id").defaultRandom().primaryKey(),
  block_number: bigint("block_number", { mode: "number" }),
  transaction_hash: varchar("transaction_hash"),
  order_book_address: varchar("order_book_address"),
};

// Trade events
export const trade = pgTable("trades", {
  ...commonFields,
  order_id: varchar("order_id"),
  maker_address: varchar("maker_address"),
  is_buy: boolean("is_buy"),
  price: varchar("price"),
  updated_size: varchar("updated_size"),
  taker_address: varchar("taker_address"),
  tx_origin: varchar("tx_origin"),
  filled_size: varchar("filled_size"),
}, (table) => [uniqueIndex("trades_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Order Created events
export const orderCreated = pgTable("order_created", {
  ...commonFields,
  order_id: varchar("order_id"),
  owner: varchar("owner"),
  size: varchar("size"),
  price: varchar("price"),
  is_buy: boolean("is_buy"),
}, (table) => [uniqueIndex("order_created_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Orders Canceled events
export const ordersCanceled = pgTable("orders_canceled", {
  ...commonFields,
  order_ids: varchar("order_ids"),
  owner: varchar("owner"),
}, (table) => [uniqueIndex("orders_canceled_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Initialized events
export const initialized = pgTable("initialized", {
  ...commonFields,
  version: varchar("version"),
}, (table) => [uniqueIndex("initialized_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Ownership Handover Canceled events
export const ownershipHandoverCanceled = pgTable("ownership_handover_canceled", {
  ...commonFields,
  pending_owner: varchar("pending_owner"),
}, (table) => [uniqueIndex("ownership_handover_canceled_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Ownership Handover Requested events
export const ownershipHandoverRequested = pgTable("ownership_handover_requested", {
  ...commonFields,
  pending_owner: varchar("pending_owner"),
}, (table) => [uniqueIndex("ownership_handover_requested_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Ownership Transferred events
export const ownershipTransferred = pgTable("ownership_transferred", {
  ...commonFields,
  old_owner: varchar("old_owner"),
  new_owner: varchar("new_owner"),
}, (table) => [uniqueIndex("ownership_transferred_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
);

// Upgraded events
export const upgraded = pgTable("upgraded", {
  ...commonFields,
  implementation: varchar("implementation"),
}, (table) => [uniqueIndex("upgraded_tx_order_book_idx").on(table.transaction_hash, table.order_book_address)]
); 