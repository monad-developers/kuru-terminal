"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tab } from '@/src/enums/tab.enum';
import { useAlliumDataStreamTrades } from '@/src/hooks/useAlliumDataStreamTrades';
import type { Trade } from '@/src/types/trade.interface';
import { useGoldskyMirrorTrades } from '../hooks/useGoldskyMirrorTrades';
import { useQuicknodeStreamTrades } from '../hooks/useQuicknodeStreamTrades';
import { useThirdwebInsightTrades } from '../hooks/useThirdwebInsightTrades';
import { useAlchemySubgraphTrades } from '../hooks/useAlchemySubgraphTrades';
import { useGoldskySubgraphTrades } from '../hooks/useGoldskySubgraphTrades';
import { useTheGraphSubgraphTrades } from '../hooks/useTheGraphSubgraphTrades';
import { useEnvioHyperIndexTrades } from '../hooks/useEnvioHyperIndexTrades';
import { usePonderTrades } from '../hooks/usePonderTrades';

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

  goldskyMirrorTrades: Trade[];
  goldskyMirrorConnected: boolean;
  goldskyMirrorError: string | null;
  goldskyMirrorLoading: boolean;
  
  quicknodeStreamTrades: Trade[];
  quicknodeStreamConnected: boolean;
  quicknodeStreamError: string | null;
  quicknodeStreamLoading: boolean;
  
  thirdwebInsightTrades: Trade[];
  thirdwebInsightLoading: boolean;
  thirdwebInsightError: string | null;

  alchemySubgraphTrades: Trade[];
  alchemySubgraphLoading: boolean;
  alchemySubgraphError: string | null;

  goldskySubgraphTrades: Trade[];
  goldskySubgraphLoading: boolean;
  goldskySubgraphError: string | null;

  theGraphSubgraphTrades: Trade[];
  theGraphSubgraphLoading: boolean;
  theGraphSubgraphError: string | null;

  envioHyperIndexTrades: Trade[];
  envioHyperIndexLoading: boolean;
  envioHyperIndexError: string | null;

  ponderTrades: Trade[];
  ponderLoading: boolean;
  ponderError: string | null;
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

  goldskyMirrorTrades: [],
  goldskyMirrorConnected: false,
  goldskyMirrorError: null,
  goldskyMirrorLoading: false,

  quicknodeStreamTrades: [],
  quicknodeStreamConnected: false,
  quicknodeStreamError: null,
  quicknodeStreamLoading: false,

  thirdwebInsightTrades: [],
  thirdwebInsightLoading: false,
  thirdwebInsightError: null,

  alchemySubgraphTrades: [],
  alchemySubgraphLoading: false,
  alchemySubgraphError: null,

  goldskySubgraphTrades: [],
  goldskySubgraphLoading: false,
  goldskySubgraphError: null,

  theGraphSubgraphTrades: [],
  theGraphSubgraphLoading: false,
  theGraphSubgraphError: null,

  envioHyperIndexTrades: [],
  envioHyperIndexLoading: false,
  envioHyperIndexError: null,

  ponderTrades: [],
  ponderLoading: false,
  ponderError: null,
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

  // Allium trades state
  const { 
    trades: alliumTrades, 
    connected: alliumConnected, 
    error: alliumError, 
    loading: alliumLoading,
    clearTrades: clearAlliumTrades 
  } = useAlliumDataStreamTrades(enabled, limit);

  // Goldsky Mirror trades state
  const { 
    trades: goldskyMirrorTrades, 
    connected: goldskyMirrorConnected, 
    error: goldskyMirrorError, 
    loading: goldskyMirrorLoading,
    clearTrades: clearGoldskyMirrorTrades
  } = useGoldskyMirrorTrades(enabled, limit);

  // Quicknode Stream trades state
  const { 
    trades: quicknodeStreamTrades, 
    connected: quicknodeStreamConnected, 
    error: quicknodeStreamError, 
    loading: quicknodeStreamLoading,
    clearTrades: clearQuicknodeStreamTrades
  } = useQuicknodeStreamTrades(enabled, limit);

  // Thirdweb Insight trades state
  const { 
    trades: thirdwebInsightTrades, 
    loading: thirdwebInsightLoading, 
    error: thirdwebInsightError 
  } = useThirdwebInsightTrades(enabled, limit);

  // Alchemy Subgraph trades state
  const {
    trades: alchemySubgraphTrades,
    loading: alchemySubgraphLoading,
    error: alchemySubgraphError
  } = useAlchemySubgraphTrades(enabled, limit, refetchInterval);

  // Goldsky Subgraph trades state
  const {
    trades: goldskySubgraphTrades,
    loading: goldskySubgraphLoading,
    error: goldskySubgraphError
  } = useGoldskySubgraphTrades(enabled, limit, refetchInterval);

  // TheGraph Subgraph trades state
  const {
    trades: theGraphSubgraphTrades,
    loading: theGraphSubgraphLoading,
    error: theGraphSubgraphError
  } = useTheGraphSubgraphTrades(enabled, limit, refetchInterval);

  // Envio HyperIndex trades state
  const {
    trades: envioHyperIndexTrades,
    loading: envioHyperIndexLoading,
    error: envioHyperIndexError
  } = useEnvioHyperIndexTrades(enabled, limit, refetchInterval);

  // Ponder trades state
  const {
    trades: ponderTrades,
    loading: ponderLoading,
    error: ponderError
  } = usePonderTrades(enabled, limit, refetchInterval);

  // Helper function to determine if a source is active
  const isSourceActive = useCallback((source: Tab): boolean => {
    return activeTab === source && enabled;
  }, [activeTab, enabled]);
  
  // Clear data for specified source or all sources if none specified
  const clearData = useCallback((source?: Tab) => {
    if (!source || source === Tab.ALLIUM_DATA_STREAM) {
      clearAlliumTrades();
    }
    if (!source || source === Tab.GOLDSKY_MIRROR) {
      clearGoldskyMirrorTrades();
    }
    if (!source || source === Tab.QUICKNODE_STREAM) {
      clearQuicknodeStreamTrades();
    }
    // Add more clear functions for other sources as they are implemented
  }, [clearAlliumTrades, clearGoldskyMirrorTrades, clearQuicknodeStreamTrades]);

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

        goldskyMirrorTrades,
        goldskyMirrorConnected,
        goldskyMirrorError,
        goldskyMirrorLoading,

        quicknodeStreamTrades,
        quicknodeStreamConnected,
        quicknodeStreamError,
        quicknodeStreamLoading,

        thirdwebInsightTrades,
        thirdwebInsightLoading,
        thirdwebInsightError,

        alchemySubgraphTrades,
        alchemySubgraphLoading,
        alchemySubgraphError,

        goldskySubgraphTrades,
        goldskySubgraphLoading,
        goldskySubgraphError,

        theGraphSubgraphTrades,
        theGraphSubgraphLoading,
        theGraphSubgraphError,

        envioHyperIndexTrades,
        envioHyperIndexLoading,
        envioHyperIndexError,

        ponderTrades,
        ponderLoading,
        ponderError,
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
    alliumTrades: context.alliumTrades,
    alliumConnected: context.alliumConnected, 
    alliumError: context.alliumError,
    alliumLoading: context.alliumLoading,

    goldskyMirrorTrades: context.goldskyMirrorTrades,
    goldskyMirrorConnected: context.goldskyMirrorConnected,
    goldskyMirrorError: context.goldskyMirrorError,
    goldskyMirrorLoading: context.goldskyMirrorLoading,

    quicknodeStreamTrades: context.quicknodeStreamTrades,
    quicknodeStreamConnected: context.quicknodeStreamConnected,
    quicknodeStreamError: context.quicknodeStreamError,
    quicknodeStreamLoading: context.quicknodeStreamLoading,

    thirdwebInsightTrades: context.thirdwebInsightTrades,
    thirdwebInsightLoading: context.thirdwebInsightLoading,
    thirdwebInsightError: context.thirdwebInsightError,

    alchemySubgraphTrades: context.alchemySubgraphTrades,
    alchemySubgraphLoading: context.alchemySubgraphLoading,
    alchemySubgraphError: context.alchemySubgraphError,

    goldskySubgraphTrades: context.goldskySubgraphTrades,
    goldskySubgraphLoading: context.goldskySubgraphLoading,
    goldskySubgraphError: context.goldskySubgraphError,

    theGraphSubgraphTrades: context.theGraphSubgraphTrades,
    theGraphSubgraphLoading: context.theGraphSubgraphLoading,
    theGraphSubgraphError: context.theGraphSubgraphError,

    envioHyperIndexTrades: context.envioHyperIndexTrades,
    envioHyperIndexLoading: context.envioHyperIndexLoading,
    envioHyperIndexError: context.envioHyperIndexError,

    ponderTrades: context.ponderTrades,
    ponderLoading: context.ponderLoading,
    ponderError: context.ponderError,
    // Add more data sources here as they are implemented
  };
};