"use client";

import { useState, useEffect, useRef } from 'react';
import { ALLIUM_WS_URL } from '@/src/config/env.config';
import { Trade } from '@/src/types/trade.interface';

export interface AlliumWsData {
  type: string;
  blockNumber: number;
  transactionHash: string;
  data: {
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
  blockTimestamp: number;
}

// Maximum number of trades to keep in state
const MAX_TRADES = 100;

export const useAlliumDataStreamTrades = (
  enabled: boolean,
  limit: number
): {
  trades: Trade[];
  connected: boolean;
  error: string | null;
  loading: boolean;
  clearTrades: () => void;
} => {
  // State for Allium WebSocket
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
        console.log('Closing Allium WebSocket connection (disabled)');
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
        const socket = new WebSocket(ALLIUM_WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          console.log('Allium WebSocket connection established');
          setConnected(true);
          setError(null);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as AlliumWsData;
            
            // Only process Trade events
            if (data.type === 'Trade') {
              setTrades(prevTrades => {
                const parsedData: Trade = {
                  id: `${data.transactionHash}-${data.data.orderBookAddress}`,
                  isBuy: data.data.isBuy,
                  price: data.data.price,
                  filledSize: data.data.filledSize,
                  makerAddress: data.data.makerAddress,
                  takerAddress: data.data.takerAddress,
                  blockHeight: data.blockNumber,
                  transactionHash: data.transactionHash,
                };
                const newTrades = [parsedData, ...prevTrades];

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
            console.error('Error parsing Allium WebSocket message:', err);
          }
        };

        socket.onclose = () => {
          console.log('Allium WebSocket connection closed');
          setConnected(false);
          
          // Only attempt to reconnect if still enabled
          if (enabled) {
            setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        };

        socket.onerror = (err) => {
          console.error('Allium WebSocket error:', err);
          setError('Error connecting to Allium WebSocket server');
          socket.close();
        };
      } catch (err) {
        console.error('Failed to create Allium WebSocket connection:', err);
        setError('Failed to establish Allium WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        console.log('Closing Allium WebSocket connection (cleanup)');
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