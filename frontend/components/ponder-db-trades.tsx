import { TradeTable } from "@/components/trade-table";
import { getTradesFromPostgres } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

export function PonderDbTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["postgres-trades", limit],
    queryFn: () => getTradesFromPostgres(limit),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
