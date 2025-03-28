import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const GOLDSKY_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_GOLDSKY_SUBGRAPH_URL!;
if (!GOLDSKY_SUBGRAPH_URL) {
  throw new Error("NEXT_PUBLIC_GOLDSKY_SUBGRAPH_URL is not set");
}

async function getTradesFromGoldsky(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(GOLDSKY_SUBGRAPH_URL, {
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

  const data = await response.json();
  return data.data.trades.map((item: any) => ({
    ...item,
    blockHeight: item.blockNumber,
  }));
}

export function GoldskySubgraphTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["goldsky-trades", limit],
    queryFn: ({ signal }) => getTradesFromGoldsky(limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
