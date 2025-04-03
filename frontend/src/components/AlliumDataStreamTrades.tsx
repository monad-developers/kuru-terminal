"use client";

import React from 'react';
import TradeTable from "@/src/components/TradeTable";
import { useTrades } from '@/src/providers/AppProvider';

const AlliumDataStreamTrades = () => {
  const { alliumTrades, alliumConnected, alliumError, alliumLoading } = useTrades();

  if (!alliumConnected) {
    return (
      <div className="rounded-md border p-4 mb-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <p>Connecting to Allium WebSocket server...</p>
      </div>
    );
  }

  if (alliumError) {
    return (
      <div className="rounded-md border p-4 bg-destructive/10 text-destructive">
        <p>Error connecting to WebSocket: {alliumError}</p>
      </div>
    );
  }


  return (
    <TradeTable trades={alliumTrades} isLoading={alliumLoading} />
  );
};

export default AlliumDataStreamTrades; 