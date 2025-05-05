import { pgTable, varchar, bigint, boolean } from "drizzle-orm/pg-core";

/**
 * Common fields shared across all event tables
 * Note: When adding new event tables, extend with these common fields
 */
const commonFields = {
  id: varchar("id").primaryKey(),
  block_number: bigint("block_number", { mode: "number" }),
  transaction_hash: varchar("transaction_hash"),
  order_book_address: varchar("order_book_address"),
};

/**
 * Trade events table schema
 * Currently the only event being indexed
 * 
 * Note: To add more event tables:
 * 1. Create a new table using pgTable
 * 2. Include commonFields
 * 3. Add event-specific fields
 * 4. Update event-transformer.service.ts to handle the new event
 */
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
