"use client";

import { useState, useEffect, useRef } from 'react';
import { QUICKNODE_STREAM_WS_URL } from '@/src/config/env.config';
import { Trade } from '@/src/types/trade.interface';

export interface QuicknodeStreamWsData {
  type: string;
  timestamp: string;
  events: {
    trade: {
      blockHeight: string,
      orderBookAddress: string,
      transactionHash: string,
      orderId: string,
      makerAddress: string,
      isBuy: boolean,
      price: string,
      updatedSize: string,
      takerAddress: string,
      txOrigin: string,
      filledSize: string
    }[]
  }
}

// Maximum number of trades to keep in state
const MAX_TRADES = 100;

export const useQuicknodeStreamTrades = (
  enabled: boolean,
  limit: number
): {
  trades: Trade[];
  connected: boolean;
  error: string | null;
  loading: boolean;
  clearTrades: () => void;
} => {
  // State for Quicknode Stream WebSocket
  const [trades, setTrades] = useState<Trade[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Function to clear the trades
  const clearTrades = () => {
    setTrades([]);
  };

  // Handle WebSocket connection and lifecycle
  useEffect(() => {
    // Skip if disabled or running on server
    if (!enabled || typeof window === 'undefined') {
      // Close connection if it exists and we're now disabled
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        console.log('Closing Quicknode Stream WebSocket connection (disabled)');
        ws.current.close();
        ws.current = null;
      }
      return;
    }

    // Don't reconnect if we already have an active connection
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    // Create WebSocket connection
    const connectWebSocket = () => {
      try {
        const socket = new WebSocket(QUICKNODE_STREAM_WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          console.log('Quicknode Stream WebSocket connection established');
          setConnected(true);
          setError(null);
        };

        socket.onmessage = (event) => {
          try {
            const parsedEventData = JSON.parse(event.data) as QuicknodeStreamWsData;

            // Process Trade events
            if (parsedEventData.type === 'events' && parsedEventData.events.trade.length > 0) {
              setTrades(prevTrades => {
                const parsedTrades: Trade[] = parsedEventData.events.trade.map(trade => ({
                  ...trade,
                  id: `${trade.transactionHash}-${trade.orderBookAddress}`,
                  blockHeight: parseInt(trade.blockHeight),
                }));

                const newTrades = [...parsedTrades, ...prevTrades];

                // Sort trades by timestamp (latest block height first)
                newTrades.sort((a, b) => {
                  const blockDiff = b.blockHeight - a.blockHeight;
                  if (blockDiff !== 0) return blockDiff;
                  return a.transactionHash.localeCompare(b.transactionHash);
                });

                // Keep only the last MAX_TRADES trades
                return newTrades.slice(0, MAX_TRADES);
              });
            }
          } catch (err) {
            console.error('Error parsing Quicknode Stream WebSocket message:', err);
          }
        };

        socket.onclose = () => {
          console.log('Quicknode Stream WebSocket connection closed');
          setConnected(false);

          // Only attempt to reconnect if still enabled
          if (enabled) {
            setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        };

        socket.onerror = (err) => {
          console.error('Quicknode Stream WebSocket error:', err);
          setError('Error connecting to Quicknode Stream WebSocket server');
          socket.close();
        };
      } catch (err) {
        console.error('Failed to create Quicknode Stream WebSocket connection:', err);
        setError('Failed to establish Quicknode Stream WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        console.log('Closing Quicknode Stream WebSocket connection (cleanup)');
        ws.current.close();
        ws.current = null;
      }
    };
  }, [enabled]);

  // Derived state
  const slicedTrades = trades.slice(0, limit);
  const loading = slicedTrades.length === 0;

  return {
    trades: slicedTrades,
    connected,
    error,
    loading,
    clearTrades
  };
};