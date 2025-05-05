import { WebSocket } from 'ws';
import { Message as KafkaMessage } from '@confluentinc/kafka-javascript';

/**
 * Currently supported events from the Kuru Order Book contract.
 * 
 * Note: To add support for more events:
 * 1. Add the event name to this array
 * 2. Add corresponding event data interface in EventData
 * 3. Update the processEvent function in server.ts to handle the new event
 * 4. Add event processing logic in formatEventData
 */
export const SUPPORTED_EVENTS = ['Trade'] as const;

export type SupportedEvent = typeof SUPPORTED_EVENTS[number];

/**
 * Extended WebSocket client interface with heartbeat tracking
 */
export interface WSClient extends WebSocket {
  isAlive: boolean;
}

/**
 * Supported security protocols for Kafka connection
 */
export type SecurityProtocol = 'plaintext' | 'ssl' | 'sasl_plaintext' | 'sasl_ssl';

/**
 * Kafka consumer configuration interface
 */
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

/**
 * Raw blockchain log structure from Kafka stream
 */
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

/**
 * Processed event structure for client consumption
 */
export interface ProcessedEvent {
  type: SupportedEvent;
  blockNumber: number;
  transactionHash: string;
  data: EventData[SupportedEvent];
  blockTimestamp: number;
}

/**
 * Event data interfaces for each supported event type.
 * 
 * Note: When adding new events, extend this interface with the new event's data structure.
 * Example:
 * ```typescript
 * interface EventData {
 *   Trade: TradeEventData;
 *   NewEvent: NewEventData;
 * }
 * ```
 */
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
}

/**
 * Supported Kafka consumer event types
 */
export type KafkaConsumerEvents = 'ready' | 'data' | 'disconnected' | 'connection.failure'; 