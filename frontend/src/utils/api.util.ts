import { Trade } from "@/db/types";

export async function getTradesFromSubgraphApi(
    subgraphUrl: string,
    limit: number,
    signal?: AbortSignal
): Promise<Trade[]> {
    // TODO:
    // 1. Strongly type the response
    // 2. Use axios instead of fetch
    const response = await fetch(subgraphUrl, {
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            query: `{
            trades(orderBy: blockNumber, orderDirection: desc, first: ${limit}) {
              blockNumber
              blockTimestamp
              filledSize
              id
              isBuy
              makerAddress
              orderBookAddress
              orderId
              price
              takerAddress
              transactionHash
              txOrigin
              updatedSize
            }
          }`,
        }),
        method: "POST",
        signal,
    });
    const { data } = await response.json();

    return data.trades.map((item: any) => ({
        ...item,
        blockHeight: item.blockNumber,
    }));
}