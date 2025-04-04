import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PONDER_GRAPHQL_API_URL } from "@/src/config/env.config";
import type { Trade } from "@/src/types/trade.interface";

export interface PonderApiTrade {
  id: string;
  isBuy: boolean;
  price: string;
  filledSize: string;
  makerAddress: string;
  takerAddress: string;
  blockHeight: number;
  txHash: string;
}

export interface PonderApiTradeResponse {
  data: {
    trades: {
      items: PonderApiTrade[];
    };
  };
}

async function getTradesFromPonderApi(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const { data } = await axios.post<PonderApiTradeResponse>(
    PONDER_GRAPHQL_API_URL,
    {
      query: `
        query Trades {
          trades(limit: ${limit}, orderBy: "blockHeight", orderDirection: "desc") {
            items {
              id
              txHash
              blockHeight
              filledSize
              isBuy
              makerAddress
              price
              takerAddress
            }
          }
        }
      `
    },
    {
      signal,
    }
  );

  const mappedTrades = data.data.trades.items.map((trade) => ({
    ...trade,
    transactionHash: trade.txHash,
  }));

  return mappedTrades;
}

export const usePonderTrades = (enabled: boolean, limit: number, refetchInterval: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["ponder-trades"],
    queryFn: ({ signal }) => getTradesFromPonderApi(limit, signal),
    enabled,
    refetchInterval,
  });

  return {
    trades: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}; 