import { useQuery } from "@tanstack/react-query";
import TradeTable from "@/src/components/TradeTable";
import { getTradesFromSubgraphApi } from "@/src/utils/api.util";
import { THEGRAPH_SUBGRAPH_URL } from "@/src/config/env.config";

const TheGraphSubgraphTrades = ({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["thegraph-trades", limit],
    queryFn: ({ signal }) => getTradesFromSubgraphApi(THEGRAPH_SUBGRAPH_URL, limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export default TheGraphSubgraphTrades;
