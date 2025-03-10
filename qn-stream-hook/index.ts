import express from "express";
import { ethers } from "ethers";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { trade } from "./db/quicknode-schema";

import "dotenv/config";

interface EventRequestBody {
  data: any[];
}

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Kuru Trade event ABI
const kuruTradeEventABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint40",
        name: "orderId",
        type: "uint40",
      },
      {
        indexed: false,
        internalType: "address",
        name: "makerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isBuy",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "updatedSize",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "address",
        name: "takerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "txOrigin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "filledSize",
        type: "uint96",
      },
    ],
    name: "Trade",
    type: "event",
  },
];

const contractAddress = "0x0000000000000000000000000000000000000000";
const contract = new ethers.Contract(contractAddress, kuruTradeEventABI);
const tradeTopic = contract.interface
  .getEvent("Trade")
  ?.topicHash.toLowerCase();

/*
Test case:

    const topics = ['0xf16924fba1c18c108912fcacaac7450c98eb3f2d8c0a3cdf3df7066c08f21581']
    const data = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ba12d525b8165943ddc529ed4127f648a3d1b47e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000117391e374b6a84860000000000000000000000000000000000000000000000000000016d23ea0fa700000000000000000000000098f6f6a9d37ec871a70b3c0b26d65b92f416d95d00000000000000000000000098f6f6a9d37ec871a70b3c0b26d65b92f416d95d00000000000000000000000000000000000000000000000000000001cfed92f4'
    const [
        orderId,
        makerAddress,
        isBuy,
        price,
        updatedSize,
        takerAddress,
        txOrigin,
        filledSize
    ] = contract.interface.decodeEventLog('Trade', data, topics);
    console.log([
        orderId,
        makerAddress,
        isBuy,
        price,
        updatedSize,
        takerAddress,
        txOrigin,
        filledSize
    ]);
*/

app.get("/", async (req, res) => {
  res.status(200).send("Hello World");
});

app.post("/", async (req, res) => {
  const { data } = req.body as EventRequestBody;
  const tradeEvents: any[] = [];

  try {
    for (const blockLogs of data) {
      for (const txLogs of blockLogs) {
        for (const log of txLogs) {
          if (log.topics.length === 0 || log.data.length === 0) {
            continue;
          }
          const eventTopic = log.topics[0].toLowerCase();
          if (eventTopic !== tradeTopic) {
            continue;
          }
          const [
            orderId,
            makerAddress,
            isBuy,
            price,
            updatedSize,
            takerAddress,
            txOrigin,
            filledSize,
          ] = contract.interface.decodeEventLog("Trade", log.data, log.topics);
          tradeEvents.push({
            orderId: orderId.toString(),
            makerAddress,
            isBuy,
            price: price.toString(),
            updatedSize: updatedSize.toString(),
            takerAddress,
            txOrigin,
            filledSize: filledSize.toString(),
            blockHeight: log.blockNumber,
          });
        }
      }
    }
    if (tradeEvents.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Inserting ${
          tradeEvents.length
        } trades into DB`
      );
      await db.insert(trade).values(tradeEvents);
    }
    res.status(200).send(JSON.stringify(tradeEvents));
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] Error processing request:`,
      error
    );
    res.status(200).send("Internal Server Error");
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(
    `Server is running on port ${PORT} and bound to all interfaces (0.0.0.0)`
  );
});
