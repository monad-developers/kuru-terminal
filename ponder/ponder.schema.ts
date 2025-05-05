import { onchainTable, index } from "ponder";

/**
 * Trade event table schema
 * Currently the only event being indexed
 * 
 * Note: To add tables for more events:
 * 1. Create new table using onchainTable()
 * 2. Define appropriate columns using table builder
 * 3. Add necessary indexes for query optimization
 * 4. Update index.ts to handle the new event type
 */
export const trade = onchainTable("trade", (t) => ({
  id: t.text().primaryKey(),
  txHash: t.hex(),
  blockHeight: t.bigint(),
  orderBookAddress: t.hex(),
  orderId: t.bigint(),
  txOrigin: t.hex(),
  makerAddress: t.hex(),
  takerAddress: t.hex(),
  isBuy: t.boolean(),
  price: t.bigint(),
  updatedSize: t.bigint(),
  filledSize: t.bigint(),
}),
(table) => ({
  blockHeightSortDescIdx: index().on(table.blockHeight.desc()).concurrently(),
  txHashIdx: index().on(table.txHash).concurrently(),
  orderIdIdx: index().on(table.orderId).concurrently(),
  orderBookAddressIdx: index().on(table.orderBookAddress).concurrently(),
}));
