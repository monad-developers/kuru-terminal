"use client";

import React from 'react';
import TradeTable from "@/src/components/TradeTable";
import { useTrades } from '@/src/providers/AppProvider';

const GoldskyMirrorTrades = () => {
  const { goldskyMirrorTrades, goldskyMirrorConnected, goldskyMirrorError, goldskyMirrorLoading } = useTrades();

  if (!goldskyMirrorConnected) {
    return (
      <div className="rounded-md border p-4 mb-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <p>Connecting to Goldsky Mirror WebSocket server...</p>
      </div>
    );
  }

  if (goldskyMirrorError) {
    return (
      <div className="rounded-md border p-4 bg-destructive/10 text-destructive">
        <p>Error connecting to WebSocket: {goldskyMirrorError}</p>
      </div>
    );
  }


  return (
    <TradeTable trades={goldskyMirrorTrades} isLoading={goldskyMirrorLoading} />
  );
};

export default GoldskyMirrorTrades; 