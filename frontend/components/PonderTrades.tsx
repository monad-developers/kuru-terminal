import { useQuery } from "@tanstack/react-query";
import TradeTable from "@/components/TradeTable";
import { PONDER_GRAPHQL_API_URL } from "@/config/env.config";
import type { Trade } from "@/db/types";

async function getTradesFromPonderApi(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(PONDER_GRAPHQL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      query: `
            query Trades {
              trades(limit: ${limit}, orderBy: "blockHeight", orderDirection: "desc") {
                items {
                  txHash
                  blockHeight
                  filledSize
                  id
                  isBuy
                  makerAddress
                  orderId
                  price
                  takerAddress
                  updatedSize
                  orderBookAddress
                }
              }
            }
          `,
    }),
  });
  const { data } = await response.json();
  return data.trades.items;
}

const PonderSubgraphTrades = ({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["ponder-trades", limit],
    queryFn: ({ signal }) => getTradesFromPonderApi(limit, signal),
    refetchInterval,
    enabled,
  });

  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export default PonderSubgraphTrades;
