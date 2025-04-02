import { WebSocket, WebSocketServer } from 'ws';
import { ethers } from 'ethers';
import { KafkaConsumer } from '@confluentinc/kafka-javascript';
import kuruOrderBookABI from './abis/KuruOrderBook.json';
import * as dotenv from 'dotenv';
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

dotenv.config();

// Create contract instance
const kuruOrderBookContract = new ethers.Contract('0x0000000000000000000000000000000000000000', kuruOrderBookABI);

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
        
        console.log(`Filtering events for ${this.validContractAddresses.size} contract addresses:`, 
            Array.from(this.validContractAddresses));

        this.initializeWebSocketHandlers();
        this.initializeKafkaHandlers();
    }

    public static async initialize(): Promise<EventStreamServer> {
        // Initialize WebSocket Server
        const wss = await EventStreamServer.createWebSocketServer();

        // Initialize event topic map with non-null topic hashes
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
     * Creates a WebSocket server instance.
     * Handles only the server creation, event handlers are set up separately.
     */
    private static createWebSocketServer(): WebSocketServer {
        return new WebSocketServer({ 
            port: Number(process.env.PORT) || 8080,
            verifyClient: () => {
                // Allow all origins
                return true;
            }
        });
    }

    /**
     * Creates and connects to a Kafka consumer with the specified configuration.
     * Handles only the connection setup, event handlers are set up separately.
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
     * Initializes WebSocket event handlers and connection management.
     * Sets up connection handling, heartbeat, and client lifecycle management.
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
     * Initializes Kafka consumer's 'data' event handler and topic subscription.
     * Sets up message processing pipeline and error handling.
     */
    private async initializeKafkaHandlers() {
        try {
            this.kafkaConsumer.on('data' as KafkaConsumerEvents, (message: KafkaMessage) => {
                try {
                    if (!message.value) {
                        console.warn('Received message with null value');
                        return;
                    }

                    const log = JSON.parse(message.value.toString()) as BlockchainLog;
                    const processedEvent = this.processEvent(log);

                    if (processedEvent) {
                        console.log(`Processed event: type=${processedEvent.type}, block=${processedEvent.blockNumber}`);
                        this.broadcast(processedEvent);
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
                data: this.formatEventData(log.address, eventName, decodedLog),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error processing event:', error);
            return null;
        }
    }

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
            case 'OrderCreated':
                return {
                    orderId: data.orderId.toString(),
                    owner: data.owner,
                    size: data.size.toString(),
                    price: data.price.toString(),
                    isBuy: data.isBuy,
                    orderBookAddress: contractAddress
                };
            case 'OrdersCanceled':
                return {
                    orderIds: data.orderId.map((id: ethers.BigNumberish) => id.toString()),
                    owner: data.owner,
                    orderBookAddress: contractAddress
                };
            case 'Initialized':
                return {
                    version: data.version.toString(),
                    orderBookAddress: contractAddress
                };
            case 'OwnershipHandoverCanceled':
            case 'OwnershipHandoverRequested':
                return {
                    pendingOwner: data.pendingOwner,
                    orderBookAddress: contractAddress
                };
            case 'OwnershipTransferred':
                return {
                    oldOwner: data.oldOwner,
                    newOwner: data.newOwner,
                    orderBookAddress: contractAddress
                };
            case 'Upgraded':
                return {
                    implementation: data.implementation,
                    orderBookAddress: contractAddress
                };
        }
    }

    private broadcast(data: ProcessedEvent) {
        const message = JSON.stringify(data);
        this.connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

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