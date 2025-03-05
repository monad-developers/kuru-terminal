/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Kuru,
  Kuru_OrderCreated,
  Kuru_OrdersCanceled,
  Kuru_Trade,
} from "generated";

Kuru.OrderCreated.handler(async ({ event, context }) => {
  const entity: Kuru_OrderCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    owner: event.params.owner,
    size: event.params.size,
    price: event.params.price,
    isBuy: event.params.isBuy,
  };

  context.Kuru_OrderCreated.set(entity);
});

Kuru.OrdersCanceled.handler(async ({ event, context }) => {
  const entity: Kuru_OrdersCanceled = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    owner: event.params.owner,
  };

  context.Kuru_OrdersCanceled.set(entity);
});

Kuru.Trade.handler(async ({ event, context }) => {
  const entity: Kuru_Trade = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    orderId: event.params.orderId,
    makerAddress: event.params.makerAddress,
    isBuy: event.params.isBuy,
    price: event.params.price,
    updatedSize: event.params.updatedSize,
    takerAddress: event.params.takerAddress,
    txOrigin: event.params.txOrigin,
    filledSize: event.params.filledSize,
    blockHeight: event.block.number,
  };

  context.Kuru_Trade.set(entity);
});
