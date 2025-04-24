import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  OrderCreated,
  OrdersCanceled,
  OwnershipHandoverCanceled,
  OwnershipHandoverRequested,
  OwnershipTransferred,
  Trade,
  Upgraded
} from "../generated/MONUSDC/KuruOrderBook"

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createOrderCreatedEvent(
  orderId: BigInt,
  owner: Address,
  size: BigInt,
  price: BigInt,
  isBuy: boolean
): OrderCreated {
  let orderCreatedEvent = changetype<OrderCreated>(newMockEvent())

  orderCreatedEvent.parameters = new Array()

  orderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "orderId",
      ethereum.Value.fromUnsignedBigInt(orderId)
    )
  )
  orderCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  orderCreatedEvent.parameters.push(
    new ethereum.EventParam("size", ethereum.Value.fromUnsignedBigInt(size))
  )
  orderCreatedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  orderCreatedEvent.parameters.push(
    new ethereum.EventParam("isBuy", ethereum.Value.fromBoolean(isBuy))
  )

  return orderCreatedEvent
}

export function createOrdersCanceledEvent(
  orderId: Array<BigInt>,
  owner: Address
): OrdersCanceled {
  let ordersCanceledEvent = changetype<OrdersCanceled>(newMockEvent())

  ordersCanceledEvent.parameters = new Array()

  ordersCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "orderId",
      ethereum.Value.fromUnsignedBigIntArray(orderId)
    )
  )
  ordersCanceledEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return ordersCanceledEvent
}

export function createOwnershipHandoverCanceledEvent(
  pendingOwner: Address
): OwnershipHandoverCanceled {
  let ownershipHandoverCanceledEvent = changetype<OwnershipHandoverCanceled>(newMockEvent())

  ownershipHandoverCanceledEvent.parameters = new Array()

  ownershipHandoverCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "pendingOwner",
      ethereum.Value.fromAddress(pendingOwner)
    )
  )

  return ownershipHandoverCanceledEvent
}

export function createOwnershipHandoverRequestedEvent(
  pendingOwner: Address
): OwnershipHandoverRequested {
  let ownershipHandoverRequestedEvent = changetype<OwnershipHandoverRequested>(newMockEvent())

  ownershipHandoverRequestedEvent.parameters = new Array()

  ownershipHandoverRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "pendingOwner",
      ethereum.Value.fromAddress(pendingOwner)
    )
  )

  return ownershipHandoverRequestedEvent
}

export function createOwnershipTransferredEvent(
  oldOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("oldOwner", ethereum.Value.fromAddress(oldOwner))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTradeEvent(
  orderId: BigInt,
  makerAddress: Address,
  isBuy: boolean,
  price: BigInt,
  updatedSize: BigInt,
  takerAddress: Address,
  txOrigin: Address,
  filledSize: BigInt
): Trade {
  let tradeEvent = changetype<Trade>(newMockEvent())

  tradeEvent.parameters = new Array()

  tradeEvent.parameters.push(
    new ethereum.EventParam(
      "orderId",
      ethereum.Value.fromUnsignedBigInt(orderId)
    )
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam(
      "makerAddress",
      ethereum.Value.fromAddress(makerAddress)
    )
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam("isBuy", ethereum.Value.fromBoolean(isBuy))
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam(
      "updatedSize",
      ethereum.Value.fromUnsignedBigInt(updatedSize)
    )
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam(
      "takerAddress",
      ethereum.Value.fromAddress(takerAddress)
    )
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam("txOrigin", ethereum.Value.fromAddress(txOrigin))
  )
  tradeEvent.parameters.push(
    new ethereum.EventParam(
      "filledSize",
      ethereum.Value.fromUnsignedBigInt(filledSize)
    )
  )

  return tradeEvent
}

export function createUpgradedEvent(implementation: Address): Upgraded {
  let upgradedEvent = changetype<Upgraded>(newMockEvent())

  upgradedEvent.parameters = new Array()

  upgradedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )

  return upgradedEvent
}
