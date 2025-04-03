import { ethers } from "ethers";
import { TradeEvent, LogEntry } from "../types";
import kuruOrderBookABI from "../abis/KuruOrderBook.json";

export const getTradeEventsFromLogs = (data: LogEntry[]): TradeEvent[] => {
  const tradeEvents: TradeEvent[] = [];
  const contractAddress = "0x0000000000000000000000000000000000000000";
  const contract = new ethers.Contract(contractAddress, kuruOrderBookABI);
  const tradeTopic = contract.interface.getEvent("Trade")?.topicHash.toLowerCase();

  for (const log of data) {
    // Skip if log is missing topics or data
    if (log.topics.length === 0 || log.data.length === 0) {
      continue;
    }

    // Skip if event topic is not a trade event
    const eventTopic = log.topics[0].toLowerCase();
    if (eventTopic !== tradeTopic) {
      continue;
    }

    // Note: Contract address filtering is done from sending the payload to the webhook by QN Stream Filter

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

    const numericBlockHeight = parseInt(log.blockNumber, 16);

    tradeEvents.push({
      blockHeight: numericBlockHeight.toString(),
      orderBookAddress: log.address, // Contract address emitting the event
      transactionHash: log.transactionHash,
      orderId: orderId.toString(),
      makerAddress,
      isBuy,
      price: price.toString(),
      updatedSize: updatedSize.toString(),
      takerAddress,
      txOrigin,
      filledSize: filledSize.toString(),
    });
  }

  return tradeEvents;
};
