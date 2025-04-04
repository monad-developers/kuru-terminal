import TradeComparison from "@/src/components/TradeComparison";

export default function Home() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Indexing Services Data Viewer</h1>
      <p className="text-muted-foreground mb-10">
        View and analyze trade data from multiple chain indexing services on Monad Testnet.
      </p>
      <TradeComparison />
    </div>
  );
}
