// test-client.ts

import { ethers } from "ethers";
import fetch from "node-fetch";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";

// Configuration
const SERVER_URL = "http://localhost:3000";
const ORDER_BOOK_ADDRESS = "0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3";

// Create contract interface for event encoding
const contract = new ethers.Contract(ORDER_BOOK_ADDRESS, kuruOrderBookABI);

// Get Trade event
const tradeEvent = contract.interface.getEvent("Trade");
if (!tradeEvent) {
  throw new Error("Trade event not found in ABI");
}

// Sample event data structure that matches what your server expects
const sampleEventData = [
  {
    address: ORDER_BOOK_ADDRESS,
    blockHash: "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
    blockNumber: "0x60c7de",
    blockTimestamp: "0x67c8b848",
    data: contract.interface.encodeEventLog(
      tradeEvent,
      [
        ethers.getBigInt(123), // orderId
        "0x1f60a5db7d24172d658ecbcd4e92f08b1ecd484a", // makerAddress
        true, // isBuy
        ethers.parseEther("1000"), // price
        ethers.getBigInt(1000000), // updatedSize
        "0xc6d20f1162cc9edc24718e4a29f515fe5777f2ac", // takerAddress
        "0x1f60a5db7d24172d658ecbcd4e92f08b1ecd484a", // txOrigin
        ethers.getBigInt(500000), // filledSize
      ]
    ).data,
    logIndex: "0x0",
    removed: false,
    topics: [
      tradeEvent.topicHash,
    ],
    transactionHash: "0xde80da0809359d14b407e34eb180edccbb660ed60c0ef4d1893df12a7e09e0c6",
    transactionIndex: "0x2",
  },
];

async function testServerConnection() {
  console.log(`Testing connection to server at: ${SERVER_URL}`);

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sampleEventData),
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log("Server response status:", response.status);
      console.log("Server response:", responseText);
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
