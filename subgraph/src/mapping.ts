import { dataSource } from '@graphprotocol/graph-ts'
import {
  Trade as TradeEvent,
} from "../generated/MONUSDC/KuruOrderBook";
import {
  Trade
} from "../generated/schema"

/**
 * Handler for Trade events from KuruOrderBook contract
 * Currently the only event being indexed
 * 
 * Note: To add handlers for more events:
 * 1. Import event type from generated contract (../generated/MONUSDC/KuruOrderBook)
 * 2. Import entity type from generated schema
 * 3. Create new handler function and map event fields to entity
 * 4. Add event handler to subgraph.yaml.mustache
 */
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
