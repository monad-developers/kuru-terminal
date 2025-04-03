import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { THIRDWEB_INSIGHT_API_URL } from "@/src/config/env.config";
import { Trade } from "../types/trade.interface";

export interface ThirdwebInsightIndexerApiResponse {
    data: {
        id: string;
        block_number: number;
        transaction_hash: string;
        order_book_address: string;
        log_index: number;
        order_id: string;
        maker_address: string;
        is_buy: boolean;
        price: string;
        updated_size: string;
        taker_address: string;
        tx_origin: string;
        filled_size: string;
    }[];
    meta: {
        limit: number;
        query_time_ms: number;
    };
}

export const useThirdwebInsightTrades = (enabled: boolean, limit: number, refetchInterval: number) => {
    const getThirdwebInsightTrades = async (signal?: AbortSignal): Promise<Trade[]> => {
        const apiUrl = `${THIRDWEB_INSIGHT_API_URL}/events`;
        const { data: { data, meta } } = await axios.get<ThirdwebInsightIndexerApiResponse>(apiUrl, {
            params: {
                event_type: "trade",
                sort_by: "block_number",
                sort_order: "desc",
                limit,
            },
            signal
        });

        // Map the API response to the Trade interface
        const trades: Trade[] = data.map((trade) => ({
            id: trade.id,
            transactionHash: trade.transaction_hash,
            blockHeight: trade.block_number,
            orderBookAddress: trade.order_book_address,
            isBuy: trade.is_buy,
            filledSize: trade.filled_size,
            makerAddress: trade.maker_address,
            takerAddress: trade.taker_address,
            orderId: trade.order_id,
            price: trade.price,
            updatedSize: trade.updated_size,
            txOrigin: trade.tx_origin,
        }));

        return trades;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ["thirdweb-insight-trades"],
        queryFn: ({ signal }) => getThirdwebInsightTrades(signal),
        enabled,
        refetchInterval,
    });

    return {
        trades: data ?? [],
        loading: isLoading,
        error: error?.message ?? null,
    };
};
