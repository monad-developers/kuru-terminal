import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as"
import { handleTrade } from "../src/mapping"
import { createTradeEvent } from "./kuru-utils"
import { Address, BigInt } from "@graphprotocol/graph-ts"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let newTradeEvent = createTradeEvent(
      BigInt.fromI32(1),
      Address.fromString("0x123"),
      true,
      BigInt.fromI32(1000),
      BigInt.fromI32(100),
      Address.fromString("0x456"),
      Address.fromString("0x789"),
      BigInt.fromI32(100)
    )
    handleTrade(newTradeEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Trade created and stored", () => {
    assert.entityCount("Trade", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Trade",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "orderId",
      "1"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
