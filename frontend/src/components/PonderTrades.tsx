import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "@/src/providers/AppProvider";

const PonderTrades = () => {
  const { ponderTrades, ponderLoading, ponderError } = useTrades();

  if (ponderError) {
    return <div>Error: {ponderError}</div>;
  }

  return <TradeTable trades={ponderTrades} isLoading={ponderLoading} />;
}

export default PonderTrades;
