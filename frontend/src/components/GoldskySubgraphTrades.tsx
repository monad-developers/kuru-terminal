import { useQuery } from "@tanstack/react-query";
import TradeTable from "@/src/components/TradeTable";
import { getTradesFromSubgraphApi } from "@/src/utils/api.util";
import { GOLDSKY_SUBGRAPH_URL } from "@/src/config/env.config";

const GoldskySubgraphTrades = ({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["goldsky-trades", limit],
    queryFn: ({ signal }) => getTradesFromSubgraphApi(GOLDSKY_SUBGRAPH_URL, limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export default GoldskySubgraphTrades;
