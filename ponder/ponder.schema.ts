import { onchainTable } from "ponder";

export const trade = onchainTable("trade", (t) => ({
  id: t.text().primaryKey(),
  orderId: t.bigint(),
  txOrigin: t.hex(),
  makerAddress: t.hex(),
  takerAddress: t.hex(),
  isBuy: t.boolean(),
  price: t.bigint(),
  updatedSize: t.bigint(),
  filledSize: t.bigint(),
  blockHeight: t.bigint(),
  orderBookAddress: t.hex(),
}));
