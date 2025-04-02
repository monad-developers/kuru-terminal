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