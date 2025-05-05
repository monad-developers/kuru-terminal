import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Trade
} from "../generated/MONUSDC/KuruOrderBook"

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
