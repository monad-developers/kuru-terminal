import axios from "axios";
import { SubgraphApiTrade, SubgraphApiTradeResponse, Trade } from "@/src/types/trade.interface";

export async function getTradesFromSubgraphApi(
    subgraphUrl: string,
    limit: number,
    signal?: AbortSignal
): Promise<Trade[]> {
    const { data } = await axios.post<SubgraphApiTradeResponse>(
        subgraphUrl,
        {
            query: `{
                trades(orderBy: blockNumber, orderDirection: desc, first: ${limit}) {
                    blockNumber
                    filledSize
                    id
                    isBuy
                    makerAddress
                    price
                    takerAddress
                    transactionHash
                }
            }`
        },
        {
            signal,
        }
    );

    return data.data.trades.map((item: SubgraphApiTrade) => ({
        ...item,
        blockHeight: item.blockNumber,
    }));
}