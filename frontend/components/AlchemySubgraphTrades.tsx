import { useQuery } from "@tanstack/react-query";
import TradeTable from "@/components/TradeTable";
import { getTradesFromSubgraphApi } from "@/utils/api.util";
import { ALCHEMY_SUBGRAPH_URL } from "@/config/env.config";

const AlchemySubgraphTrades = ({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["alchemy-trades", limit],
    queryFn: ({ signal }) => getTradesFromSubgraphApi(ALCHEMY_SUBGRAPH_URL, limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export default AlchemySubgraphTrades;
