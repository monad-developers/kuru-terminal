import { useQuery } from "@tanstack/react-query";
import { getTradesFromSubgraphApi } from "@/src/utils/api.util";
import { GOLDSKY_SUBGRAPH_URL } from "@/src/config/env.config";
import { Trade } from "../types/trade.interface";

export const useGoldskySubgraphTrades = (enabled: boolean, limit: number, refetchInterval: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["goldsky-subgraph-trades"],
        queryFn: ({ signal }) => getTradesFromSubgraphApi(GOLDSKY_SUBGRAPH_URL, limit, signal),
        enabled,
        refetchInterval,
    });

    return {
        trades: data ?? [],
        loading: isLoading,
        error: error?.message ?? null,
    };
}; 