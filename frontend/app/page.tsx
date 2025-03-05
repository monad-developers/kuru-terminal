import { TradeComparison } from "@/components/trade-comparison";

export default function Home() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Trade Data Comparison</h1>
      <p className="text-muted-foreground mb-10">
        Compare the performance of different data fetching approaches for
        displaying trade data
      </p>

      <TradeComparison />
    </div>
  );
}
