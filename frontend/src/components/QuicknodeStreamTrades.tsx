"use client";

import React from 'react';
import TradeTable from "@/src/components/TradeTable";
import { useTrades } from '@/src/providers/AppProvider';

const QuicknodeStreamTrades = () => {
  const { quicknodeStreamTrades, quicknodeStreamConnected, quicknodeStreamError, quicknodeStreamLoading } = useTrades();

  if (!quicknodeStreamConnected) {
    return (
      <div className="rounded-md border p-4 mb-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <p>Connecting to Quicknode Stream WebSocket server...</p>
      </div>
    );
  }

  if (quicknodeStreamError) {
    return (
      <div className="rounded-md border p-4 bg-destructive/10 text-destructive">
        <p>Error connecting to WebSocket: {quicknodeStreamError}</p>
      </div>
    );
  }


  return (
    <TradeTable trades={quicknodeStreamTrades} isLoading={quicknodeStreamLoading} />
  );
};

export default QuicknodeStreamTrades; 