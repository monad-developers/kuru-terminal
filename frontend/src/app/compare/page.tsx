"use client";

import IndexingServiceComparison from "@/src/components/IndexingServiceComparison";

export default function Compare() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Indexing Service Comparison</h1>
      <p className="mb-6">
        This page compares the performance of different blockchain indexing services by showing the latest block 
        fetched by each service. The most recent block is highlighted in green, while the oldest is highlighted in red.
      </p>
      <IndexingServiceComparison />
    </div>
  );
} 