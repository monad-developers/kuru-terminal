export interface LogEntry {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string; // hex string
  transactionHash: string;
  transactionIndex: string; // hex string
  blockHash: string;
  logIndex: string; // hex string
  removed: boolean;
}

export interface TradeEvent {
  blockHeight: string;
  orderBookAddress: string;
  transactionHash: string;
  orderId: string;
  makerAddress: string;
  isBuy: boolean;
  price: string;
  updatedSize: string;
  takerAddress: string;
  txOrigin: string;
  filledSize: string;
}
