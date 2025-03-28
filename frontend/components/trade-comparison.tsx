"use client";

import {
  ENVIO_SUBGRAPH_URL,
  EnvioSubgraphTrades,
} from "@/components/envio-subgraph-trades";
import {
  PONDER_SUBGRAPH_URL,
  PonderSubgraphTrades,
} from "@/components/ponder-subgraph-trades";
import {
  THEGRAPH_SUBGRAPH_URL,
  TheGraphSubgraphTrades,
} from "@/components/the-graph-subgraph-trades";
import { GOLDSKY_SUBGRAPH_URL, GoldskySubgraphTrades } from "./GoldskySubgraphTrades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

enum TAB {
  PONDER_SUBGRAPH = "ponder-subgraph",
  ENVIO_SUBGRAPH = "envio-subgraph",
  THEGRAPH_SUBGRAPH = "thegraph-subgraph",
  GOLDSKY_SUBGRAPH = "goldsky-subgraph",
}

export function TradeComparison() {
  const [activeTab, setActiveTab] = useState<TAB>(TAB.PONDER_SUBGRAPH);
  const [refetchInterval, setRefetchInterval] = useState<number>(1000); // ms
  const [enabled, setEnabled] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(20);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TAB);
  };

  const handleIntervalChange = (value: number[]) => {
    setRefetchInterval(value[0]);
  };

  const handleLimitChange = (value: number[]) => {
    setLimit(value[0]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Trade Data</CardTitle>
          <div className="flex space-x-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Enabled: {enabled ? "Yes" : "No"}
              </span>
              <Button size="sm" onClick={() => setEnabled(!enabled)}>
                Toggle
              </Button>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Refetch every {refetchInterval / 1000}s
              </span>
              <div className="w-32">
                <Slider
                  defaultValue={[1000]}
                  min={100}
                  max={3000}
                  step={100}
                  value={[refetchInterval]}
                  onValueChange={handleIntervalChange}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Limit: {limit}
              </span>
              <div className="w-32">
                <Slider
                  defaultValue={[20]}
                  min={1}
                  max={100}
                  step={1}
                  value={[limit]}
                  onValueChange={handleLimitChange}
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={TAB.PONDER_SUBGRAPH}
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value={TAB.PONDER_SUBGRAPH}>
                Ponder Subgraph
              </TabsTrigger>
              <TabsTrigger value={TAB.ENVIO_SUBGRAPH}>
                Envio Subgraph
              </TabsTrigger>
              <TabsTrigger value={TAB.THEGRAPH_SUBGRAPH}>
                The Graph Subgraph
              </TabsTrigger>
              <TabsTrigger value={TAB.GOLDSKY_SUBGRAPH}>
                Goldsky Subgraph
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={TAB.PONDER_SUBGRAPH}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Ponder Subgraph</h3>
              <p className="text-sm text-muted-foreground">
                This tab fetches trade data using ponder's GraphQL API hosted on{" "}
                <a href={PONDER_SUBGRAPH_URL} className="underline">
                  {PONDER_SUBGRAPH_URL}
                </a>
                . Check out <code>./indexer/README.md</code> for more
                information on how to run the indexer.
              </p>
            </div>
            <PonderSubgraphTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.PONDER_SUBGRAPH && enabled}
            />
          </TabsContent>

          <TabsContent value={TAB.ENVIO_SUBGRAPH}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Envio Subgraph</h3>
              <p className="text-sm text-muted-foreground">
                This tab fetches trade data using Envio's GraphQL API hosted on{" "}
                <a href={ENVIO_SUBGRAPH_URL} className="underline">
                  {ENVIO_SUBGRAPH_URL}
                </a>
                . Check out <code>./envio/README.md</code> for more information
                on how to run the indexer.
              </p>
            </div>
            <EnvioSubgraphTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.ENVIO_SUBGRAPH && enabled}
            />
          </TabsContent>

          <TabsContent value={TAB.THEGRAPH_SUBGRAPH}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">The Graph Subgraph</h3>
              <p className="text-sm  text-muted-foreground">
                This tab fetches trade data using The Graph's API hosted on{" "}
                <a href={THEGRAPH_SUBGRAPH_URL} className="underline">
                  {THEGRAPH_SUBGRAPH_URL}
                </a>
                . Check out <code>./thegraph/README.md</code> for more
                information on how to run the indexer.
              </p>
            </div>
            <TheGraphSubgraphTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.THEGRAPH_SUBGRAPH && enabled}
            />
          </TabsContent>

          <TabsContent value={TAB.GOLDSKY_SUBGRAPH}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Goldsky Subgraph</h3>
              <p className="text-sm  text-muted-foreground">
                This tab fetches trade data using Goldsky's API hosted on{" "}
                <a href={GOLDSKY_SUBGRAPH_URL} className="underline">
                  {GOLDSKY_SUBGRAPH_URL}
                </a>
                . Check out <code>./goldsky/README.md</code> for more
                information on how to run the indexer.
              </p>
            </div>
            <GoldskySubgraphTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.GOLDSKY_SUBGRAPH && enabled}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
