import { ethers } from "ethers";
import { TradeEvent, LogEntry } from "./types";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";

export const decodeTradeEventsFromLogs = (data: LogEntry[][][]): TradeEvent[] => {
  const tradeEvents: TradeEvent[] = [];
  const contractAddress = "0x0000000000000000000000000000000000000000";
  const contract = new ethers.Contract(contractAddress, kuruOrderBookABI);
  const tradeTopic = contract.interface.getEvent("Trade")?.topicHash.toLowerCase();

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

        const numericBlockHeight = parseInt(log.blockNumber, 16);
        
        tradeEvents.push({
          orderId: orderId.toString(),
          makerAddress,
          isBuy,
          price: price.toString(),
          updatedSize: updatedSize.toString(),
          takerAddress,
          txOrigin,
          filledSize: filledSize.toString(),
          blockHeight: numericBlockHeight.toString(),
          orderBookAddress: log.address, // Contract address emitting the event
        });
      }
    }
  }
  
  return tradeEvents;
};
