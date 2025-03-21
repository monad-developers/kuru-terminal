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

export interface EventRequestBody {
  data: LogEntry[][][];
}

export interface TradeEvent {
  orderId: string;
  makerAddress: string;
  isBuy: boolean;
  price: string;
  updatedSize: string;
  takerAddress: string;
  txOrigin: string;
  filledSize: string;
  blockHeight: string;
  orderBookAddress: string;
}
