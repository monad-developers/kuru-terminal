import { WebSocket, WebSocketServer } from 'ws';
import { KuruEvents } from '../types';

// Extended WebSocket interface with the isAlive flag for heartbeat
interface WSClient extends WebSocket {
  isAlive: boolean;
}

/**
 * WebSocket stream service for broadcasting Kuru events to connected clients
 */
export class EventWsStream {
  private readonly wss: WebSocketServer;
  private readonly connectedClients: Set<WSClient> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    console.log(`[${new Date().toISOString()}] Initializing WebSocket server on port ${port}`);
    this.wss = this.createWebSocketServer(port);
    this.initializeWebSocketHandlers();
    this.startHeartbeat();
  }

  /**
   * Creates a WebSocket server instance
   */
  private createWebSocketServer(port: number): WebSocketServer {
    return new WebSocketServer({ 
      port,
      verifyClient: () => {
        // Allow all origins
        return true;
      }
    });
  }

  /**
   * Initializes WebSocket event handlers and connection management
   */
  private initializeWebSocketHandlers(): void {
    console.log(`[${new Date().toISOString()}] WebSocket server initialized and listening for connections...`);
    
    this.wss.on('connection', (ws: WebSocket) => {
      console.log(`[${new Date().toISOString()}] New client connected`);
      const client = ws as WSClient;
      client.isAlive = true;
      this.connectedClients.add(client);

      client.on('pong', () => {
        client.isAlive = true;
      });

      client.on('close', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected`);
        this.connectedClients.delete(client);
      });

      client.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] WebSocket error:`, error);
      });

      // Send initial connection success message
      client.send(JSON.stringify({ type: 'connection', status: 'connected' }));
    });

    this.wss.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] WebSocket server error:`, error);
    });
  }

  /**
   * Start heartbeat to keep connections alive and clean up dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connectedClients.forEach(client => {
        if (!client.isAlive) {
          console.log(`[${new Date().toISOString()}] Client failed heartbeat check, terminating connection`);
          this.connectedClients.delete(client);
          return client.terminate();
        }
        client.isAlive = false;
        client.ping();
      });
    }, 30000);
  }

  /**
   * Broadcast events to all connected clients
   */
  public broadcastEvents(events: KuruEvents): void {
    if (this.connectedClients.size === 0) {
      return; // No clients connected
    }

    console.log(`[${new Date().toISOString()}] Broadcasting events to ${this.connectedClients.size} connected clients`);
    
    // Format events for broadcasting
    const eventData = {
      timestamp: new Date().toISOString(),
      events
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
    console.log(`[${new Date().toISOString()}] WebSocket server shut down`);
  }
} 