import { pgTable, varchar, bigint, boolean, timestamp, uuid, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";

// Track the last indexed block per contract
export const contractBlockTracker = pgTable("contract_block_tracker", {
  contract_address: varchar("contract_address").notNull(),
  last_indexed_block: bigint("last_indexed_block", { mode: "number" }).default(0),
  last_updated: timestamp("last_updated").defaultNow(),
  contract_name: varchar("contract_name"),
}, (table) => [primaryKey({ columns: [table.contract_address] })]
);

// Trade events
export const trade = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),
  block_number: bigint("block_number", { mode: "number" }),
  transaction_hash: varchar("transaction_hash"),
  order_book_address: varchar("order_book_address"),
  log_index: bigint("log_index", { mode: "number" }),
  order_id: varchar("order_id"),
  maker_address: varchar("maker_address"),
  is_buy: boolean("is_buy"),
  price: varchar("price"),
  updated_size: varchar("updated_size"),
  taker_address: varchar("taker_address"),
  tx_origin: varchar("tx_origin"),
  filled_size: varchar("filled_size"),
}, (table) => [uniqueIndex("trades_tx_log_idx").on(table.transaction_hash, table.log_index)]
);
