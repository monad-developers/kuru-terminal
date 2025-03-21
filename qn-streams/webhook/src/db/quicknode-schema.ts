import { pgSchema } from "drizzle-orm/pg-core";

export const quicknodeSchema = pgSchema("quicknode");

export const trade = quicknodeSchema.table("trade", (t) => ({
  id: t.integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: t.numeric("order_id", {
    precision: 78,
    scale: 0,
  }),
  txOrigin: t.text("tx_origin"),
  makerAddress: t.text("maker_address"),
  takerAddress: t.text("taker_address"),
  isBuy: t.boolean("is_buy"),
  price: t.numeric("price", {
    precision: 78,
    scale: 0,
  }),
  updatedSize: t.numeric("updated_size", {
    precision: 78,
    scale: 0,
  }),
  filledSize: t.numeric("filled_size", {
    precision: 78,
    scale: 0,
  }),
  blockHeight: t.numeric("block_height", {
    precision: 78,
    scale: 0,
  }),
  orderBookAddress: t.text("order_book_address"),
}));
