import fetch from "node-fetch";
import { ethers } from "ethers";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";
import { RawLog } from "./types";

// Configuration
const SERVER_URL = "https://kuru-indexer-gs-mirror-monad-foundation-c9bb33f5.koyeb.app/";
const CONTRACT_ADDRESS = "0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3";

// Create contract interface for encoding events
const contract = new ethers.Contract(CONTRACT_ADDRESS, kuruOrderBookABI);

// Helper function to create a log object
function createLog(address: string, topics: string[], data: string, blockNumber = "0x60c7de"): RawLog {
  return {
    id: `${blockNumber}-0x2`,
    address,
    block_number: parseInt(blockNumber),
    block_hash: "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
    block_timestamp: parseInt("0x67c8b848"),
    data,
    log_index: 0,
    topics: topics.join(","),
    transaction_hash: "0xde80da0809359d14b407e34eb180edccbb660ed60c0ef4d1893df12a7e09e0c6",
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

// Generate sample event data
function generateSampleEvents(): RawLog[] {
  const events = [];
  const randomAddress = () => ethers.Wallet.createRandom().address;

  // 1. Trade event
  const tradeEvent = contract.interface.encodeEventLog(
    getEventOrThrow("Trade"),
    [
      123n, // orderId
      randomAddress(), // makerAddress
      true, // isBuy
      ethers.parseEther("1000"), // price
      1000000n, // updatedSize
      randomAddress(), // takerAddress
      randomAddress(), // txOrigin
      500000n, // filledSize
    ]
  );
  events.push(createLog(CONTRACT_ADDRESS, tradeEvent.topics, tradeEvent.data));

  // 2. OrderCreated event
  const orderCreatedEvent = contract.interface.encodeEventLog(
    getEventOrThrow("OrderCreated"),
    [
      124n, // orderId
      randomAddress(), // owner
      2000000n, // size
      1500, // price
      false, // isBuy
    ]
  );
  events.push(createLog(CONTRACT_ADDRESS, orderCreatedEvent.topics, orderCreatedEvent.data));

  // 3. OrdersCanceled event
  const ordersCanceledEvent = contract.interface.encodeEventLog(
    getEventOrThrow("OrdersCanceled"),
    [
      [125n, 126n], // orderIds
      randomAddress(), // owner
    ]
  );
  events.push(createLog(CONTRACT_ADDRESS, ordersCanceledEvent.topics, ordersCanceledEvent.data));

  // 4. Initialized event
  const initializedEvent = contract.interface.encodeEventLog(
    getEventOrThrow("Initialized"),
    [1n] // version
  );
  events.push(createLog(CONTRACT_ADDRESS, initializedEvent.topics, initializedEvent.data));

  return events;
}

// Sample event data structure that matches what your server expects
const sampleEventData = {
  data: generateSampleEvents()
};

async function testServerConnection() {
  console.log(`Testing connection to server at: ${SERVER_URL}`);
  console.log("Sending sample events:", JSON.stringify(sampleEventData, null, 2));

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleEventData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Server response status:", response.status);
      console.log("Server response:", JSON.stringify(responseData, null, 2));
      console.log("✅ Connection successful!");
    } else {
      console.error("❌ Server returned error status:", response.status);
      console.error("Error details:", await response.text());
    }
  } catch (error) {
    console.error("❌ Failed to connect to server:");
    console.error(error);
    console.log("\nPossible reasons:");
    console.log("1. Server is not running");
    console.log("2. Server URL is incorrect");
    console.log("3. Network/firewall is blocking the connection");
    console.log("4. Server is not publicly accessible");
  }
}

// Run the test
testServerConnection();
