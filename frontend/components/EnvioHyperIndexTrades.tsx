import { useQuery } from "@tanstack/react-query";
import TradeTable from "@/components/TradeTable";
import { ENVIO_HYPERINDEX_API_URL } from "@/config/env.config";
import type { Trade } from "@/db/types";

export async function getTradesFromEnvioHyperIndex(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch(ENVIO_HYPERINDEX_API_URL, {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{
          KuruOrderBook_Trade(order_by: {blockHeight: desc}, limit: ${limit}) {
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
  const { data } = await response.json();

  return data.KuruOrderBook_Trade;
}

const EnvioHyperIndexTrades = ({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["envio-hyperindex-trades", limit],
    queryFn: ({ signal }) => getTradesFromEnvioHyperIndex(limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export default EnvioHyperIndexTrades;
