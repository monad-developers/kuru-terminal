/*
  Tests seem to be inconsistently available across implementations
  
  Can we either get rid of them altogether or make tests available for all implementations?
*/

import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { ethers } from "ethers";
import kuruOrderBookABI from "../src/abis/KuruOrderBook.json";
import { RawLog } from "../src/types";

// Configuration
const SERVER_URL = process.env.WEBHOOK_URL || "http://localhost:3000";
const CONTRACT_ADDRESS = "0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3";
const contract = new ethers.Contract(CONTRACT_ADDRESS, kuruOrderBookABI);

// Utility functions
function createLog(
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
  logIndex = 0,
  id?: string,
  txHash = "0xde80da0809359d14b407e34eb180edccbb660ed60c0ef4d1893df12a7e09e0c6",
): RawLog {
  return {
    id: id || `${blockNumber}-${logIndex}`,
    address,
    block_number: blockNumber,
    block_hash: "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
    block_timestamp: timestamp,
    data,
    log_index: logIndex,
    topics: topics.join(","),
    transaction_hash: txHash,
    transaction_index: 2
  };
}

function getEventOrThrow(eventName: string) {
  const event = contract.interface.getEvent(eventName);
  if (!event) {
    throw new Error(`Event ${eventName} not found in ABI`);
  }
  return event;
}

// Test functions
async function sendEvents(events: RawLog[]) {
  console.log(`Sending events to: ${SERVER_URL}`);
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response:", result);
    return result;
  } catch (error) {
    console.error("Failed to send events:", error);
    throw error;
  }
}

async function testBasicEventProcessing() {
  console.log("\n🧪 Testing basic event processing...");
  const randomAddress = () => ethers.Wallet.createRandom().address;
  const tradeEvent = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      randomAddress(),
      true,
      ethers.parseEther("1000"),
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  const now = Math.floor(Date.now() / 1000);
  await sendEvents([createLog(CONTRACT_ADDRESS, tradeEvent.topics, tradeEvent.data, 100, now)]);
}

async function testReorgHandling() {
  console.log("\n🧪 Testing reorg handling...");
  console.log("  This test simulates a chain reorg by sending two events with the same ID.");
  console.log("  Mirror handles reorgs by sending events in order - the last event received should be used.");

  const randomAddress = () => ethers.Wallet.createRandom().address;
  const makerAddress = randomAddress();
  const eventId = "test-reorg-1";
  const timestamp = Math.floor(Date.now() / 1000);

  const tradeEvent1 = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("1000"),  // Original amount
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  const tradeEvent2 = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("1100"),  // Updated amount after reorg
      900000n,
      randomAddress(),
      randomAddress(),
      400000n,
    ]
  );

  // First event - this would be replaced during a reorg
  console.log("  Sending first event (original state)...");
  await sendEvents([createLog(CONTRACT_ADDRESS, tradeEvent1.topics, tradeEvent1.data, 100, timestamp, 0, eventId)]);

  // Second event with same ID - simulates reorged state
  console.log("  Sending second event (reorged state) - this should replace the first...");
  await sendEvents([createLog(CONTRACT_ADDRESS, tradeEvent2.topics, tradeEvent2.data, 101, timestamp, 0, eventId)]);
}

async function testBatchDeduplication() {
  console.log("\n🧪 Testing batch deduplication...");
  console.log("  This test sends multiple events with the same ID in a single batch.");
  console.log("  The last one in the batch should be used (Mirror streams events chronologically).");

  const randomAddress = () => ethers.Wallet.createRandom().address;
  const makerAddress = randomAddress();
  const eventId = "test-dedup-1";
  const timestamp = Math.floor(Date.now() / 1000);

  // Create three versions of the same event with different data
  const tradeEvent1 = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("900"),  // First version
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  const tradeEvent2 = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("950"),  // Second version
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  const tradeEvent3 = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("1000"),  // Final version - should be the one that's kept
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  // Create logs with the same ID but different data in same batch
  // The last one (at index 2) should be used according to our new understanding
  const logs = [
    createLog(CONTRACT_ADDRESS, tradeEvent1.topics, tradeEvent1.data, 100, timestamp, 0, eventId),
    createLog(CONTRACT_ADDRESS, tradeEvent2.topics, tradeEvent2.data, 101, timestamp, 0, eventId),
    createLog(CONTRACT_ADDRESS, tradeEvent3.topics, tradeEvent3.data, 102, timestamp, 0, eventId)
  ];

  console.log("  Sending batch with 3 versions of the same event (last should win)...");
  await sendEvents(logs);
}

async function testMultipleEventTypes() {
  console.log("\n🧪 Testing multiple event types...");
  const randomAddress = () => ethers.Wallet.createRandom().address;
  const makerAddress = randomAddress();
  const now = Math.floor(Date.now() / 1000);

  const tradeEvent = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n,
      makerAddress,
      true,
      ethers.parseEther("10"),
      1000000n,
      randomAddress(),
      randomAddress(),
      500000n,
    ]
  );

  const orderCreatedEvent = contract.interface.encodeEventLog(
    getEventOrThrow("OrderCreated"),
    [
      123n,
      makerAddress,
      1000000n,
      ethers.parseEther("0.0000000001"),
      true,
    ]
  );

  const logs = [
    createLog(CONTRACT_ADDRESS, tradeEvent.topics, tradeEvent.data, 100, now),
    createLog(CONTRACT_ADDRESS, orderCreatedEvent.topics, orderCreatedEvent.data, 101, now),
    createLog(CONTRACT_ADDRESS, tradeEvent.topics, tradeEvent.data, 102, now),
    createLog(CONTRACT_ADDRESS, orderCreatedEvent.topics, orderCreatedEvent.data, 103, now)
  ];

  await sendEvents(logs);
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting API tests...");

  try {
    await testBasicEventProcessing();
    await testReorgHandling();
    await testBatchDeduplication();
    await testMultipleEventTypes();

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  }
}
runAllTests();