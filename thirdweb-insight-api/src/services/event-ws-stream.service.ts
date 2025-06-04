import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { TradeEvent } from '../db/types';
import { createLogger } from '../utils/logger.util';

// Extended WebSocket interface with the isAlive flag for heartbeat
interface WSClient extends WebSocket {
  isAlive: boolean;
}

// CORS Configuration
const getAllowedOrigin = (): string => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error('Missing required environment variable: FRONTEND_URL');
  }
  return frontendUrl;
};

/**
 * WebSocket stream service for broadcasting trade events to connected clients
 */
export class EventWsStream {
  private readonly logger = createLogger('EventWsStream');
  private readonly WS_PORT = Number(process.env.WS_PORT) || 8080;
  private readonly wss: WebSocketServer;
  private readonly connectedClients: Set<WSClient> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.logger.info(`Initializing WebSocket server on port ${this.WS_PORT}`);
    this.wss = this.createWebSocketServer(this.WS_PORT);
    this.initializeWebSocketHandlers();
    this.startHeartbeat();
  }

  /**
   * Creates a WebSocket server instance with CORS protection
   */
  private createWebSocketServer(port: number): WebSocketServer {
    const allowedOrigin = getAllowedOrigin();
    
    return new WebSocketServer({
      port,
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
   * Initializes WebSocket event handlers and connection management
   */
  private initializeWebSocketHandlers(): void {
    this.logger.info('WebSocket server initialized and listening for connections...');

    this.wss.on('connection', (ws: WebSocket) => {
      this.logger.info('New client connected');
      const client = ws as WSClient;
      client.isAlive = true;
      this.connectedClients.add(client);

      client.on('pong', () => {
        client.isAlive = true;
      });

      client.on('close', () => {
        this.logger.info('Client disconnected');
        this.connectedClients.delete(client);
      });

      client.on('error', (error) => {
        this.logger.error('WebSocket error:', error);
      });

      // Send initial connection success message
      client.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    });

    this.wss.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });
  }

  /**
   * Start heartbeat to keep connections alive and clean up dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connectedClients.forEach(client => {
        if (!client.isAlive) {
          this.logger.info('Client failed heartbeat check, terminating connection');
          this.connectedClients.delete(client);
          return client.terminate();
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);
  }

  /**
   * Broadcast trade events to all connected clients
   */
  public broadcastTradeEvents(tradeEvents: TradeEvent[]): void {
    if (this.connectedClients.size === 0) {
      return; // No clients connected
    }

    this.logger.info(`Broadcasting ${tradeEvents.length} trade events to ${this.connectedClients.size} connected clients`);

    // Format events for broadcasting
    const eventData = {
      type: 'events',
      timestamp: new Date().toISOString(),
      events: {
        trade: tradeEvents,
        // Note: Other events can be added here as needed
      }
    };

    const message = JSON.stringify(eventData);
    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Returns the count of currently connected clients
   */
  public getConnectedClientCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Shutdown the WebSocket server
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.wss.close();
    this.logger.info('WebSocket server shut down');
  }
} 