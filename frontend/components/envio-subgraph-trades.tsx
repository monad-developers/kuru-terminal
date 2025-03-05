import { TradeTable } from "@/components/trade-table";
import type { Trade } from "@/db/types";
import { useQuery } from "@tanstack/react-query";

export const ENVIO_SUBGRAPH_URL = process.env.NEXT_PUBLIC_ENVIO_SUBGRAPH_URL!;
if (!ENVIO_SUBGRAPH_URL) {
  throw new Error("NEXT_PUBLIC_ENVIO_SUBGRAPH_URL is not set");
}

export async function getTradesFromEnvio(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(ENVIO_SUBGRAPH_URL, {
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": "testing",
    },
    body: JSON.stringify({
      query: `{
          Kuru_Trade(order_by: {blockHeight: desc}, limit: ${limit}) {
            db_write_timestamp
            filledSize
            id
            isBuy
            makerAddress
            orderId
            takerAddress
            price
            txOrigin
            updatedSize
            blockHeight
          }
        }`,
    }),
    method: "POST",
    signal,
  });

  const data = await response.json();
  return data.data.Kuru_Trade;
}

export function EnvioSubgraphTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["envio-trades", limit],
    queryFn: ({ signal }) => getTradesFromEnvio(limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
