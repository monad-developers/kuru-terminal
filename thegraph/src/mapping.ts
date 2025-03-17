import { dataSource } from '@graphprotocol/graph-ts'
import {
  Initialized as InitializedEvent,
  OrderCreated as OrderCreatedEvent,
  OrdersCanceled as OrdersCanceledEvent,
  OwnershipHandoverCanceled as OwnershipHandoverCanceledEvent,
  OwnershipHandoverRequested as OwnershipHandoverRequestedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Trade as TradeEvent,
  Upgraded as UpgradedEvent
} from "../generated/MONUSDC/KuruOrderBook";
import {
  Initialized,
  OrderCreated,
  OrdersCanceled,
  OwnershipHandoverCanceled,
  OwnershipHandoverRequested,
  OwnershipTransferred,
  Trade,
  Upgraded
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrderCreated(event: OrderCreatedEvent): void {
  let entity = new OrderCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orderId = event.params.orderId
  entity.owner = event.params.owner
  entity.size = event.params.size
  entity.price = event.params.price
  entity.isBuy = event.params.isBuy
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrdersCanceled(event: OrdersCanceledEvent): void {
  let entity = new OrdersCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orderId = event.params.orderId
  entity.owner = event.params.owner
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipHandoverCanceled(
  event: OwnershipHandoverCanceledEvent
): void {
  let entity = new OwnershipHandoverCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pendingOwner = event.params.pendingOwner
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipHandoverRequested(
  event: OwnershipHandoverRequestedEvent
): void {
  let entity = new OwnershipHandoverRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.pendingOwner = event.params.pendingOwner
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldOwner = event.params.oldOwner
  entity.newOwner = event.params.newOwner
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTrade(event: TradeEvent): void {
  let entity = new Trade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.orderId = event.params.orderId
  entity.makerAddress = event.params.makerAddress
  entity.isBuy = event.params.isBuy
  entity.price = event.params.price
  entity.updatedSize = event.params.updatedSize
  entity.takerAddress = event.params.takerAddress
  entity.txOrigin = event.params.txOrigin
  entity.filledSize = event.params.filledSize
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpgraded(event: UpgradedEvent): void {
  let entity = new Upgraded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.implementation = event.params.implementation
  entity.orderBookAddress = dataSource.address().toHexString()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
} 