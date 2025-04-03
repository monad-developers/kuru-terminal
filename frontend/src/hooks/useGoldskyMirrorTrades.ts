"use client";

import { useState, useEffect, useRef } from 'react';
import { GOLDSKY_MIRROR_WS_URL } from '@/src/config/env.config';
import { Trade } from '@/src/types/trade.interface';

export interface GoldMirrorWsData {
  type: string;
  timestamp: string;
  events: {
    trade: {
      id: string,
      block_number: number,
      transaction_hash: string,
      order_book_address: string,
      order_id: string,
      maker_address: string,
      is_buy: boolean,
      price: string,
      updated_size: string,
      taker_address: string,
      tx_origin: string,
      filled_size: string
    }[]
  }
}

// Maximum number of trades to keep in state
const MAX_TRADES = 100;

export const useGoldskyMirrorTrades = (
  enabled: boolean,
  limit: number
): {
  trades: Trade[];
  connected: boolean;
  error: string | null;
  loading: boolean;
  clearTrades: () => void;
} => {
  // State for Goldsky Mirror WebSocket
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
        console.log('Closing Goldsky Mirror WebSocket connection (disabled)');
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
        const socket = new WebSocket(GOLDSKY_MIRROR_WS_URL);
        ws.current = socket;

        socket.onopen = () => {
          console.log('Goldsky Mirror WebSocket connection established');
          setConnected(true);
          setError(null);
        };

        socket.onmessage = (event) => {
          try {
            const parsedEventData = JSON.parse(event.data) as GoldMirrorWsData;

            // Process Trade events
            if (parsedEventData.type === 'events' && parsedEventData.events.trade.length > 0) {
              setTrades(prevTrades => {
                const parsedTrades: Trade[] = parsedEventData.events.trade.map(trade => ({
                  id: trade.id,
                  isBuy: trade.is_buy,
                  price: trade.price,
                  filledSize: trade.filled_size,
                  makerAddress: trade.maker_address,
                  takerAddress: trade.taker_address,
                  blockHeight: trade.block_number,
                  transactionHash: trade.transaction_hash,
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
            console.error('Error parsing Goldsky Mirror WebSocket message:', err);
          }
        };

        socket.onclose = () => {
          console.log('Goldsky Mirror WebSocket connection closed');
          setConnected(false);

          // Only attempt to reconnect if still enabled
          if (enabled) {
            setTimeout(() => {
              connectWebSocket();
            }, 3000);
          }
        };

        socket.onerror = (err) => {
          console.error('Goldsky Mirror WebSocket error:', err);
          setError('Error connecting to Goldsky Mirror WebSocket server');
          socket.close();
        };
      } catch (err) {
        console.error('Failed to create Goldsky Mirror WebSocket connection:', err);
        setError('Failed to establish Goldsky Mirror WebSocket connection');
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        console.log('Closing Goldsky Mirror WebSocket connection (cleanup)');
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