import { ethers } from "ethers";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";

export const MONAD_TESTNET_CHAIN_ID = 10143;

// Kuru event topic hashes
const contractInterface = new ethers.Interface(kuruOrderBookABI);
export const kuruEventTopics = {
  trade: contractInterface.getEvent("Trade")?.topicHash.toLowerCase(),
  orderCreated: contractInterface.getEvent("OrderCreated")?.topicHash.toLowerCase(),
  ordersCanceled: contractInterface.getEvent("OrdersCanceled")?.topicHash.toLowerCase(),
  initialized: contractInterface.getEvent("Initialized")?.topicHash.toLowerCase(),
  ownershipHandoverCanceled: contractInterface.getEvent("OwnershipHandoverCanceled")?.topicHash.toLowerCase(),
  ownershipHandoverRequested: contractInterface.getEvent("OwnershipHandoverRequested")?.topicHash.toLowerCase(),
  ownershipTransferred: contractInterface.getEvent("OwnershipTransferred")?.topicHash.toLowerCase(),
  upgraded: contractInterface.getEvent("Upgraded")?.topicHash.toLowerCase(),
};