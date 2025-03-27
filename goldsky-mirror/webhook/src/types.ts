import {
  TradeEvent,
  OrderCreatedEvent,
  OrdersCanceledEvent,
  InitializedEvent,
  OwnershipHandoverCanceledEvent,
  OwnershipHandoverRequestedEvent,
  OwnershipTransferredEvent,
  UpgradedEvent,
} from "./db/types";

// Raw log type from Goldsky Mirror Pipeline
export interface RawLog {
  id: string;
  block_number: number;
  block_hash: string;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  data: string;
  topics: string;
  block_timestamp: number;
}

export interface KuruEvents {
  trade: TradeEvent[];
  orderCreated: OrderCreatedEvent[];
  ordersCanceled: OrdersCanceledEvent[];
  initialized: InitializedEvent[];
  ownershipHandoverCanceled: OwnershipHandoverCanceledEvent[];
  ownershipHandoverRequested: OwnershipHandoverRequestedEvent[];
  ownershipTransferred: OwnershipTransferredEvent[];
  upgraded: UpgradedEvent[];
}
