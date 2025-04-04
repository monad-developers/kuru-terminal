export interface Trade {
  id: string;
  isBuy: boolean;
  price: string;
  filledSize: string;
  makerAddress: string;
  takerAddress: string;
  blockHeight: number;
  transactionHash: string;
}

export interface SubgraphApiTrade {
  id: string;
  isBuy: boolean;
  price: string;
  filledSize: string;
  makerAddress: string;
  takerAddress: string;
  blockNumber: number;
  transactionHash: string;
}

export interface SubgraphApiTradeResponse {
  data: {
    trades: SubgraphApiTrade[];
  };
}