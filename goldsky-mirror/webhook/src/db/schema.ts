import { pgTable, varchar, bigint, boolean } from "drizzle-orm/pg-core";

// Common fields for all event tables
const commonFields = {
  id: varchar("id").primaryKey(),
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
});

// Order Created events
export const orderCreated = pgTable("order_created", {
  ...commonFields,
  order_id: varchar("order_id"),
  owner: varchar("owner"),
  size: varchar("size"),
  price: varchar("price"),
  is_buy: boolean("is_buy"),
});

// Orders Canceled events
export const ordersCanceled = pgTable("orders_canceled", {
  ...commonFields,
  order_ids: varchar("order_ids"),
  owner: varchar("owner"),
});

// Initialized events
export const initialized = pgTable("initialized", {
  ...commonFields,
  version: varchar("version"),
});

// Ownership Handover Canceled events
export const ownershipHandoverCanceled = pgTable("ownership_handover_canceled", {
  ...commonFields,
  pending_owner: varchar("pending_owner"),
});

// Ownership Handover Requested events
export const ownershipHandoverRequested = pgTable("ownership_handover_requested", {
  ...commonFields,
  pending_owner: varchar("pending_owner"),
});

// Ownership Transferred events
export const ownershipTransferred = pgTable("ownership_transferred", {
  ...commonFields,
  old_owner: varchar("old_owner"),
  new_owner: varchar("new_owner"),
});

// Upgraded events
export const upgraded = pgTable("upgraded", {
  ...commonFields,
  implementation: varchar("implementation"),
}); 