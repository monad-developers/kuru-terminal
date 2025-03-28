import { onchainTable, index } from "ponder";

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
