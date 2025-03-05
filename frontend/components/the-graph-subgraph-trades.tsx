import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const THEGRAPH_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_THEGRAPH_SUBGRAPH_URL!;
if (!THEGRAPH_SUBGRAPH_URL) {
  throw new Error("NEXT_PUBLIC_THEGRAPH_SUBGRAPH_URL is not set");
}

async function getTradesFromTheGraph(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(THEGRAPH_SUBGRAPH_URL, {
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

  const data = await response.json();
  return data.data.trades.map((item: any) => ({
    ...item,
    blockHeight: item.blockNumber,
  }));
}

export function TheGraphSubgraphTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["thegraph-trades", limit],
    queryFn: ({ signal }) => getTradesFromTheGraph(limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
