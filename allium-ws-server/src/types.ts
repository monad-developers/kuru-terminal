import { WebSocket } from 'ws';
import { Message as KafkaMessage } from '@confluentinc/kafka-javascript';

export const SUPPORTED_EVENTS = [
  'Initialized',
  'OrderCreated',
  'OrdersCanceled',
  'OwnershipHandoverCanceled',
  'OwnershipHandoverRequested',
  'OwnershipTransferred',
  'Trade',
  'Upgraded'
] as const;

export type SupportedEvent = typeof SUPPORTED_EVENTS[number];

export interface WSClient extends WebSocket {
  isAlive: boolean;
}

export type SecurityProtocol = 'plaintext' | 'ssl' | 'sasl_plaintext' | 'sasl_ssl';

export interface KafkaConfig {
  'bootstrap.servers': string;
  'sasl.username': string;
  'sasl.password': string;
  'security.protocol': SecurityProtocol;
  'sasl.mechanisms': string;
  'group.id': string;
  'auto.offset.reset': string;
}

export { KafkaMessage };

export interface BlockchainLog {
  block_hash: string;
  block_number: number;
  block_timestamp: number;
  transaction_hash: string;
  transaction_index: number;
  log_index: number;
  address: string;
  address_hex: string;
  address_base58: string;
  from_address: string;
  from_address_hex: string;
  from_address_base58: string;
  to_address: string;
  to_address_hex: string;
  to_address_base58: string;
  data: string;
  topic0: string | null;
  topic1: string | null;
  topic2: string | null;
  topic3: string | null;
  _metadata: {
    fetched_at: number;
    published_at: number;
    version: number;
  };
}

export interface ProcessedEvent {
  type: SupportedEvent;
  blockNumber: number;
  transactionHash: string;
  data: EventData[SupportedEvent];
  blockTimestamp: number;
}

export interface EventData {
  Trade: {
    orderId: string;
    makerAddress: string;
    isBuy: boolean;
    price: string;
    updatedSize: string;
    takerAddress: string;
    txOrigin: string;
    filledSize: string;
    orderBookAddress: string;
  };
  OrderCreated: {
    orderId: string;
    owner: string;
    size: string;
    price: string;
    isBuy: boolean;
    orderBookAddress: string;
  };
  OrdersCanceled: {
    orderIds: string[];
    owner: string;
    orderBookAddress: string;
  };
  Initialized: {
    version: string;
    orderBookAddress: string;
  };
  OwnershipHandoverCanceled: {
    pendingOwner: string;
    orderBookAddress: string;
  };
  OwnershipHandoverRequested: {
    pendingOwner: string;
    orderBookAddress: string;
  };
  OwnershipTransferred: {
    oldOwner: string;
    newOwner: string;
    orderBookAddress: string;
  };
  Upgraded: {
    implementation: string;
    orderBookAddress: string;
  };
}

export type KafkaConsumerEvents = 'ready' | 'data' | 'disconnected' | 'connection.failure'; 