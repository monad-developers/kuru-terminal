import { ethers } from "ethers";
import kuruOrderBookABI from "./abis/KuruOrderBook.json";

export const MONAD_TESTNET_CHAIN_ID = 10143;

// Kuru event topic hashes
const contractInterface = new ethers.Interface(kuruOrderBookABI);
export const KURU_TRADE_EVENT_TOPIC = contractInterface.getEvent("Trade")?.topicHash.toLowerCase();
