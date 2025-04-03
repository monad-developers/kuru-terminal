import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "../providers/AppProvider";

const ThirdwebInsightTrades = () => {
  const { thirdwebInsightTrades, thirdwebInsightLoading, thirdwebInsightError } = useTrades();

  if (thirdwebInsightError) {
    return <div>Error fetching trades from API: {thirdwebInsightError}</div>;
  }

  return <TradeTable trades={thirdwebInsightTrades} isLoading={thirdwebInsightLoading} />;
}

export default ThirdwebInsightTrades;
