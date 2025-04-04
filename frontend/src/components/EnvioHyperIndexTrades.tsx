import TradeTable from "@/src/components/TradeTable";
import { useTrades } from "@/src/providers/AppProvider";

const EnvioHyperIndexTrades = () => {
  const { envioHyperIndexTrades, envioHyperIndexLoading, envioHyperIndexError } = useTrades();

  if (envioHyperIndexError) {
    return <div>Error: {envioHyperIndexError}</div>;
  }

  return <TradeTable trades={envioHyperIndexTrades} isLoading={envioHyperIndexLoading} />;
}

export default EnvioHyperIndexTrades;
