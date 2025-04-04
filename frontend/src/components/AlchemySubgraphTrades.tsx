import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "@/src/providers/AppProvider";

const AlchemySubgraphTrades = () => {
  const { alchemySubgraphTrades, alchemySubgraphLoading, alchemySubgraphError } = useTrades();

  if (alchemySubgraphError) {
    return <div>Error: {alchemySubgraphError}</div>;
  }

  return <TradeTable trades={alchemySubgraphTrades} isLoading={alchemySubgraphLoading} />;
}

export default AlchemySubgraphTrades;
