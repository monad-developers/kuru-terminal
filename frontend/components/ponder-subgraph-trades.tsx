import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const PONDER_SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_PONDER_SUBGRAPH_URL!;
if (!PONDER_SUBGRAPH_URL) {
  throw new Error("NEXT_PUBLIC_PONDER_SUBGRAPH_URL is not set");
}

async function getTradesFromGraphQL(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(PONDER_SUBGRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      query: `
            query Trades {
              trades(limit: ${limit}, orderBy: "blockNumber", orderDirection: "desc") {
                items {
                  blockNumber
                  blockTimestamp
                  filledSize
                  id
                  isBuy
                  orderId
                  makerAddress
                  price
                  takerAddress
                  updatedSize
                  txOrigin
                }
              }
            }
          `,
    }),
  });

  const data = await response.json();
  return data.data.trades.items;
}

export function PonderSubgraphTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["graphql-trades", limit],
    queryFn: ({ signal }) => getTradesFromGraphQL(limit, signal),
    refetchInterval,
    enabled,
  });

  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
