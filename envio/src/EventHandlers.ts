/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  KuruOrderBook,
  KuruOrderBook_Initialized,
  KuruOrderBook_OrderCreated,
  KuruOrderBook_OrdersCanceled,
  KuruOrderBook_OwnershipHandoverCanceled,
  KuruOrderBook_OwnershipHandoverRequested,
  KuruOrderBook_OwnershipTransferred,
  KuruOrderBook_Trade,
  KuruOrderBook_Upgraded,
} from "generated";

KuruOrderBook.OrderCreated.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_OrderCreated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    orderId: event.params.orderId,
    owner: event.params.owner,
    size: event.params.size,
    price: event.params.price,
    isBuy: event.params.isBuy,
  };

  context.KuruOrderBook_OrderCreated.set(entity);
});

KuruOrderBook.OrdersCanceled.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_OrdersCanceled = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    orderId: event.params.orderId,
    owner: event.params.owner,
  };

  context.KuruOrderBook_OrdersCanceled.set(entity);
});

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

KuruOrderBook.Initialized.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_Initialized = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    version: event.params.version,
  };

  context.KuruOrderBook_Initialized.set(entity);
});

KuruOrderBook.OwnershipHandoverCanceled.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_OwnershipHandoverCanceled = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    pendingOwner: event.params.pendingOwner,
  };

  context.KuruOrderBook_OwnershipHandoverCanceled.set(entity);
});

KuruOrderBook.OwnershipHandoverRequested.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_OwnershipHandoverRequested = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    pendingOwner: event.params.pendingOwner,
  };

  context.KuruOrderBook_OwnershipHandoverRequested.set(entity);
});

KuruOrderBook.OwnershipTransferred.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_OwnershipTransferred = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    oldOwner: event.params.oldOwner,
    newOwner: event.params.newOwner,
  };

  context.KuruOrderBook_OwnershipTransferred.set(entity);
});

KuruOrderBook.Upgraded.handler(async ({ event, context }) => {
  const entity: KuruOrderBook_Upgraded = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    blockHeight: event.block.number,
    transactionHash: event.transaction.hash,
    orderBookAddress: event.srcAddress,
    implementation: event.params.implementation,
  };

  context.KuruOrderBook_Upgraded.set(entity);
});
