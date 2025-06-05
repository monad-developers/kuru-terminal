/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  KuruOrderBook,
  KuruOrderBook_Trade,
} from "generated";

KuruOrderBook.Trade.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_Trade = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    orderId: event.params.orderId,
    makerAddress: event.params.makerAddress,
    isBuy: event.params.isBuy,
    price: event.params.price,
    updatedSize: event.params.updatedSize,
    takerAddress: event.params.takerAddress,
    txOrigin: event.params.txOrigin,
    filledSize: event.params.filledSize,
  };

  context.KuruOrderBook_Trade.set(entity);
});

/*
  Can this be removed?
*/
// Note: To add handlers for additional events:
// 1. Import the new event type from generated:
// import { KuruOrderBook_OrderCreated } from "generated";
//
// 2. Add a new handler following this pattern:
// KuruOrderBook.OrderCreated.handler(async ({ event, context }) => {
//   const entity: KuruOrderBook_OrderCreated = {
//     id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
//     blockHeight: event.block.number,
//     transactionHash: event.transaction.hash,
//     orderBookAddress: event.srcAddress,
//     // ... map other event parameters
//   };
//   context.KuruOrderBook_OrderCreated.set(entity);
// });
