import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "@/src/providers/AppProvider";

const GoldskySubgraphTrades = () => {
  const { goldskySubgraphTrades, goldskySubgraphLoading, goldskySubgraphError } = useTrades();

  if (goldskySubgraphError) {
    return <div>Error: {goldskySubgraphError}</div>;
  }

  return <TradeTable trades={goldskySubgraphTrades} isLoading={goldskySubgraphLoading} />;
}

export default GoldskySubgraphTrades;
