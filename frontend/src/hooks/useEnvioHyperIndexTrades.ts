import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ENVIO_HYPERINDEX_API_URL } from "@/src/config/env.config";
import type { Trade } from "@/src/types/trade.interface";

export interface EnvioHyperIndexApiTrade {
  id: string;
  blockHeight: number;
  // transactionHash: string;
  filledSize: string;
  isBuy: boolean;
  makerAddress: string;
  takerAddress: string;
  price: string;
}

export interface EnvioHyperIndexApiTradeResponse {
  data: {
    KuruOrderBook_Trade: EnvioHyperIndexApiTrade[];
  };
}

export async function getTradesFromEnvioHyperIndex(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const { data } = await axios.post<EnvioHyperIndexApiTradeResponse>(
    ENVIO_HYPERINDEX_API_URL,
    {
      // TODO: Add transaction hash once supported from Indexer's side
      query: `{
          KuruOrderBook_Trade(order_by: {blockHeight: desc}, limit: ${limit}) {
            id
            blockHeight
            filledSize
            isBuy
            makerAddress
            takerAddress
            price
          }
        }`
    },
    {
      signal,
    }
  );

  const mappedTrades = data.data.KuruOrderBook_Trade.map((trade) => ({
    ...trade,
    // TODO: Add transaction hash once supported from Indexer's side
    transactionHash: "",
  }));

  return mappedTrades;
}

export const useEnvioHyperIndexTrades = (enabled: boolean, limit: number, refetchInterval: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["envio-hyperindex-trades"],
    queryFn: ({ signal }) => getTradesFromEnvioHyperIndex(limit, signal),
    enabled,
    refetchInterval,
  });

  return {
    trades: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}; 