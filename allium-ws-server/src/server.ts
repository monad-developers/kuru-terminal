import { WebSocket, WebSocketServer } from 'ws';
import { ethers } from 'ethers';
import { KafkaConsumer } from '@confluentinc/kafka-javascript';
import kuruOrderBookABI from './abis/KuruOrderBook.json';
import * as dotenv from 'dotenv';
import { IncomingMessage } from 'http';
import {
    SUPPORTED_EVENTS,
    SupportedEvent,
    WSClient,
    KafkaMessage,
    BlockchainLog,
    ProcessedEvent,
    EventData,
    KafkaConsumerEvents,
    KafkaConfig
} from './types';
import tradingPairsConfig from '../config/trading-pairs.json';
import { DbService } from './services/db.service';

dotenv.config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
}

// CORS Configuration
const getAllowedOrigin = (): string => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
        throw new Error('Missing required environment variable: FRONTEND_URL');
    }
    return frontendUrl;
};

// Create contract instance
const kuruOrderBookContract = new ethers.Contract('0x0000000000000000000000000000000000000000', kuruOrderBookABI);

/**
 * EventStreamServer class that handles WebSocket connections and Kafka message processing
 * for Kuru Order Book Trade events.
 * 
 * Currently focused on Trade events only for simplicity and demonstration purposes.
 * 
 * Note: To add support for more events:
 * 1. Update the SUPPORTED_EVENTS array in types.ts
 * 2. Add event interface in EventData (types.ts)
 * 3. Add event processing logic in formatEventData method
 * 4. Update documentation accordingly
 */
class EventStreamServer {
    private readonly wss: WebSocketServer;
    private readonly kafkaConsumer: KafkaConsumer;
    private readonly connectedClients: Set<WSClient> = new Set();
    private readonly eventTopicMap: Map<string, SupportedEvent>;
    private readonly validContractAddresses: Set<string>; // Kuru Order Book deployment addresses

    private constructor(wss: WebSocketServer, kafkaConsumer: KafkaConsumer, eventTopicMap: Map<string, SupportedEvent>) {
        this.wss = wss;
        this.kafkaConsumer = kafkaConsumer;
        this.eventTopicMap = eventTopicMap;
        this.validContractAddresses = new Set(
            tradingPairsConfig.tradingPairs.map(pair => pair.address.toLowerCase())
        );

        console.log(`Filtering Trade events for ${this.validContractAddresses.size} contract addresses:`,
            Array.from(this.validContractAddresses));

        this.initializeWebSocketHandlers();
        this.initializeKafkaHandlers();
    }

    /**
     * Initializes WebSocket server, Kafka consumer and event mappings
     */
    public static async initialize(): Promise<EventStreamServer> {
        // Initialize WebSocket Server
        const wss = await EventStreamServer.createWebSocketServer();

        // Initialize event topic map for Trade event
        const eventTopicMap = new Map(
            SUPPORTED_EVENTS.map(eventName => {
                const event = kuruOrderBookContract.interface.getEvent(eventName);
                if (!event) {
                    throw new Error(`Event ${eventName} not found in ABI`);
                }
                const topicHash = event.topicHash.toLowerCase();
                console.log(`Mapping ${eventName} event to topic hash ${topicHash}`);
                return [topicHash, eventName];
            })
        );

        // Initialize Kafka Consumer
        const kafkaConsumer = await EventStreamServer.createKafkaConsumer();

        return new EventStreamServer(wss, kafkaConsumer, eventTopicMap);
    }

    /**
     * Creates WebSocket server instance with CORS protection
     */
    private static createWebSocketServer(): WebSocketServer {
        const allowedOrigin = getAllowedOrigin();

        return new WebSocketServer({
            port: Number(process.env.PORT) || 8080,
            verifyClient: (info: { origin: string; secure: boolean; req: IncomingMessage }) => {
                if (info.origin === allowedOrigin) {
                    console.log(`WebSocket connection allowed from origin: ${info.origin}`);
                    return true;
                } else {
                    console.warn(`WebSocket connection rejected from origin: ${info.origin}`);
                    return false;
                }
            }
        });
    }

    /**
     * Creates Kafka consumer with configured authentication and topic subscription
     */
    private static async createKafkaConsumer(): Promise<KafkaConsumer> {
        if (!process.env.BOOTSTRAP_SERVERS || !process.env.CLUSTER_API_KEY || !process.env.CLUSTER_API_SECRET) {
            throw new Error('Missing required Kafka configuration in environment variables');
        }

        const config: KafkaConfig = {
            'bootstrap.servers': process.env.BOOTSTRAP_SERVERS,
            'sasl.username': process.env.CLUSTER_API_KEY,
            'sasl.password': process.env.CLUSTER_API_SECRET,
            'security.protocol': 'sasl_ssl',
            'sasl.mechanisms': 'PLAIN',
            'group.id': 'stream-share.ss-912zj-0',
            'auto.offset.reset': 'earliest'
        };

        return new Promise((resolve, reject) => {
            const consumer = new KafkaConsumer(config);

            consumer
                .on('ready' as KafkaConsumerEvents, () => {
                    console.log('Kafka consumer ready');
                    resolve(consumer);
                })
                // .on('data' as KafkaConsumerEvents, (message: KafkaMessage) => {
                //     console.log('Kafka consumer data', message);
                // })
                .on('connection.failure' as KafkaConsumerEvents, (error: any) => {
                    console.error('Kafka consumer error:', error);
                    reject(error);
                });

            consumer.connect();
        });
    }

    /**
     * Sets up WebSocket connection handlers and heartbeat mechanism
     */
    private initializeWebSocketHandlers() {
        console.log('WebSocket server initialized and listening for connections...');

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New client connected');
            const client = ws as WSClient;
            client.isAlive = true;
            this.connectedClients.add(client);

            client.on('pong', () => {
                client.isAlive = true;
            });

            client.on('close', () => {
                console.log('Client disconnected');
                this.connectedClients.delete(client);
            });

            client.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Send initial connection success message
            client.send(JSON.stringify({ type: 'connection', status: 'connected' }));
        });

        this.wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });

        // Heartbeat to keep connections alive
        setInterval(() => {
            this.connectedClients.forEach(client => {
                if (!client.isAlive) {
                    this.connectedClients.delete(client);
                    return client.terminate();
                }
                client.isAlive = false;
                client.ping();
            });
        }, 30000);
    }

    /**
     * Sets up Kafka consumer event handlers and message processing
     */
    private async initializeKafkaHandlers() {
        try {
            this.kafkaConsumer.on('data' as KafkaConsumerEvents, async (message: KafkaMessage) => {
                try {
                    if (!message.value) {
                        console.warn('Received message with null value');
                        return;
                    }

                    const log = JSON.parse(message.value.toString()) as BlockchainLog;
                    const processedEvent = this.processEvent(log);

                    if (processedEvent) {
                        console.log(`Processed event: type=${processedEvent.type}, block=${processedEvent.blockNumber}`);

                        // Broadcast to WebSocket clients
                        this.broadcast(processedEvent);

                        // Database save with proper error propagation
                        try {
                            await DbService.saveTradeEvent(processedEvent);
                        } catch (dbError) {
                            console.error(`[${new Date().toISOString()}] Database save failed for event:`, dbError);
                            // Re-throw to signal failure to Kafka/Allium for retry logic
                            throw dbError;
                        }
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });

            await this.kafkaConsumer.subscribe(['monad_testnet.logs']);
            this.kafkaConsumer.consume();

            console.log('Kafka consumer connected and subscribed to topics');
        } catch (error) {
            console.error('Error setting up Kafka consumer:', error);
            process.exit(1);
        }
    }

    /**
     * Processes blockchain log into typed event data
     * @param log - Raw blockchain log from Kafka stream
     * @returns Processed event data or null if invalid
     */
    private processEvent(log: BlockchainLog): ProcessedEvent | null {
        const topics = [log.topic0, log.topic1, log.topic2, log.topic3].filter(topic => topic !== null);

        if (!topics[0] || !log.data) return null;

        // Check if the log comes from a valid contract address
        const contractAddress = log.address.toLowerCase();
        if (!this.validContractAddresses.has(contractAddress)) return null;

        const eventTopic = topics[0].toLowerCase();
        const eventName = this.eventTopicMap.get(eventTopic);

        if (!eventName) return null;

        try {
            const decodedLog = kuruOrderBookContract.interface.decodeEventLog(
                eventName,
                log.data,
                topics
            );

            return {
                type: eventName,
                blockNumber: log.block_number,
                transactionHash: log.transaction_hash,
                data: this.formatEventData(log.address, eventName, decodedLog),
                blockTimestamp: log.block_timestamp
            };
        } catch (error) {
            console.error('Error processing event:', error);
            return null;
        }
    }

    /**
     * Formats event data based on the event type.
     * Currently only handles Trade events.
     * 
     * @param contractAddress - Address of the contract that emitted the event
     * @param eventName - Name of the event
     * @param data - Decoded event data
     * @returns Formatted event data
     * 
     * Note: When adding new events:
     * 1. Add a new case in the switch statement
     * 2. Implement the corresponding data formatting logic
     * 3. Update the return type in the EventData interface (types.ts)
     */
    private formatEventData(contractAddress: string, eventName: SupportedEvent, data: ethers.Result): EventData[SupportedEvent] {
        switch (eventName) {
            case 'Trade':
                return {
                    orderId: data.orderId.toString(),
                    makerAddress: data.makerAddress,
                    isBuy: data.isBuy,
                    price: data.price.toString(),
                    updatedSize: data.updatedSize.toString(),
                    takerAddress: data.takerAddress,
                    txOrigin: data.txOrigin,
                    filledSize: data.filledSize.toString(),
                    orderBookAddress: contractAddress
                };
        }
    }

    /**
     * Broadcasts event data to all connected WebSocket clients
     * 
     * @param data - Processed event data to broadcast
     */
    private broadcast(data: ProcessedEvent) {
        const message = JSON.stringify(data);
        this.connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    /**
     * Gracefully shuts down WebSocket server and Kafka consumer
     */
    public shutdown() {
        this.kafkaConsumer.disconnect();
        this.wss.close();
    }
}

// Handle graceful shutdown
let server: EventStreamServer;

EventStreamServer.initialize()
    .then(instance => {
        server = instance;
    })
    .catch(error => {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    });

process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    server.shutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down...');
    server.shutdown();
    process.exit(0);
});