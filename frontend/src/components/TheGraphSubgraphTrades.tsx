import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "@/src/providers/AppProvider";

const TheGraphSubgraphTrades = () => {
  const { theGraphSubgraphTrades, theGraphSubgraphLoading, theGraphSubgraphError } = useTrades();

  if (theGraphSubgraphError) {
    return <div>Error: {theGraphSubgraphError}</div>;
  }

  return <TradeTable trades={theGraphSubgraphTrades} isLoading={theGraphSubgraphLoading} />;
}

export default TheGraphSubgraphTrades;
