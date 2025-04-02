"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tab } from '@/src/enums/tab.enum';
import { useAlliumTrades } from '@/src/hooks/useAlliumTrades';
import type { Trade } from '@/src/types/trade.interface';

// Define the context type with app state and actions
interface AppContextType {
  // UI State
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  limit: number;
  setLimit: (limit: number) => void;
  refetchInterval: number;
  setRefetchInterval: (interval: number) => void;
  
  // Generic actions
  clearData: (source?: Tab) => void;

  // Derived state
  isSourceActive: (source: Tab) => boolean;
  
  // Data sources
  alliumTrades: Trade[];
  alliumConnected: boolean;
  alliumError: string | null;
  alliumLoading: boolean;
  // Additional sources will be added here as they are implemented
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  // UI State with defaults
  activeTab: Tab.PONDER,
  setActiveTab: () => {},
  enabled: false,
  setEnabled: () => {},
  limit: 20,
  setLimit: () => {},
  refetchInterval: 1000,
  setRefetchInterval: () => {},
  
  // Generic actions
  clearData: () => {},

  // Derived state
  isSourceActive: () => false,
  
  // Data sources
  alliumTrades: [],
  alliumConnected: false,
  alliumError: null,
  alliumLoading: false,
  
  // Additional sources will be added here as they are implemented
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // UI state
  const [activeTab, setActiveTab] = useState<Tab>(Tab.PONDER);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(20);
  const [refetchInterval, setRefetchInterval] = useState<number>(1000); // ms

  // Allium WebSocket state
  const { 
    trades: alliumTrades, 
    connected: alliumConnected, 
    error: alliumError, 
    loading: alliumLoading,
    clearTrades: clearAlliumTrades 
  } = useAlliumTrades(enabled, limit);

  // Helper function to determine if a source is active
  const isSourceActive = useCallback((source: Tab): boolean => {
    return activeTab === source && enabled;
  }, [activeTab, enabled]);
  
  // Clear data for specified source or all sources if none specified
  const clearData = useCallback((source?: Tab) => {
    if (!source || source === Tab.ALLIUM_WS) {
      clearAlliumTrades();
    }
    // Add more clear functions for other sources as they are implemented
  }, [clearAlliumTrades]);

  return (
    <AppContext.Provider 
      value={{ 
        // UI State
        activeTab, 
        setActiveTab,
        enabled,
        setEnabled,
        limit,
        setLimit,
        refetchInterval,
        setRefetchInterval,
        
        // Actions
        clearData,

        // Derived state
        isSourceActive,
        
        // Data sources
        alliumTrades,
        alliumConnected,
        alliumError,
        alliumLoading,
        
        // Additional sources will be added here as they are implemented
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the App context
export const useApp = () => useContext(AppContext);

// Convenience hook for trades data
export const useTrades = () => {
  const context = useContext(AppContext);
  return {
    // Allium trades
    alliumTrades: context.alliumTrades,
    alliumConnected: context.alliumConnected, 
    alliumError: context.alliumError,
    alliumLoading: context.alliumLoading,
    
    // Add more data sources here as they are implemented
  };
};