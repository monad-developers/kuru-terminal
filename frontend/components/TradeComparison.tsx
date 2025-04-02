"use client";

import EnvioHyperIndexTrades from "@/components/EnvioHyperIndexTrades";
import PonderTrades from "@/components/PonderTrades";
import TheGraphSubgraphTrades from "@/components/TheGraphSubgraphTrades";
import GoldskySubgraphTrades from "@/components/GoldskySubgraphTrades";
import AlchemySubgraphTrades from "./AlchemySubgraphTrades";
import AlliumWSTrades from "./AlliumWSTrades";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ENVIO_HYPERINDEX_API_URL,
  PONDER_GRAPHQL_API_URL,
  THEGRAPH_SUBGRAPH_URL,
  GOLDSKY_SUBGRAPH_URL,
  ALCHEMY_SUBGRAPH_URL,
  ALLIUM_WS_URL,
} from "@/config/env.config";
import { Tab } from "@/enums/tab.enum";
import { useApp } from "@/providers/AppProvider";

const TradeComparison = () => {
  const {
    activeTab,
    setActiveTab,
    refetchInterval,
    setRefetchInterval,
    enabled,
    setEnabled,
    limit,
    setLimit,
    isSourceActive
  } = useApp();

  const handleTabChange = (value: string) => {
    setActiveTab(value as Tab);
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

      {enabled ? (
        <CardContent>
          <Tabs
            defaultValue={Tab.PONDER}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value={Tab.PONDER}>
                  Ponder Subgraph
                </TabsTrigger>
                <TabsTrigger value={Tab.ENVIO_HYPERINDEX}>
                  Envio Subgraph
                </TabsTrigger>
                <TabsTrigger value={Tab.THEGRAPH_SUBGRAPH}>
                  The Graph Subgraph
                </TabsTrigger>
                <TabsTrigger value={Tab.GOLDSKY_SUBGRAPH}>
                  Goldsky Subgraph
                </TabsTrigger>
                <TabsTrigger value={Tab.ALCHEMY_SUBGRAPH}>
                  Alchemy Subgraph
                </TabsTrigger>
                <TabsTrigger value={Tab.ALLIUM_WS}>
                  Allium WebSocket
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={Tab.PONDER}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Ponder Subgraph</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data using ponder's GraphQL API hosted on{" "}
                  <a href={PONDER_GRAPHQL_API_URL} className="underline">
                    {PONDER_GRAPHQL_API_URL}
                  </a>
                  . Check out <code>./indexer/README.md</code> for more
                  information on how to run the indexer.
                </p>
              </div>
              <PonderTrades
                limit={limit}
                refetchInterval={refetchInterval}
                enabled={isSourceActive(Tab.PONDER)}
              />
            </TabsContent>

            <TabsContent value={Tab.ENVIO_HYPERINDEX}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Envio Subgraph</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data using Envio's GraphQL API hosted on{" "}
                  <a href={ENVIO_HYPERINDEX_API_URL} className="underline">
                    {ENVIO_HYPERINDEX_API_URL}
                  </a>
                  . Check out <code>./envio/README.md</code> for more information
                  on how to run the indexer.
                </p>
              </div>
              <EnvioHyperIndexTrades
                limit={limit}
                refetchInterval={refetchInterval}
                enabled={isSourceActive(Tab.ENVIO_HYPERINDEX)}
              />
            </TabsContent>

            <TabsContent value={Tab.THEGRAPH_SUBGRAPH}>
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
                enabled={isSourceActive(Tab.THEGRAPH_SUBGRAPH)}
              />
            </TabsContent>

            <TabsContent value={Tab.GOLDSKY_SUBGRAPH}>
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
                enabled={isSourceActive(Tab.GOLDSKY_SUBGRAPH)}
              />
            </TabsContent>

            <TabsContent value={Tab.ALCHEMY_SUBGRAPH}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Alchemy Subgraph</h3>
                <p className="text-sm  text-muted-foreground">
                  This tab fetches trade data using Alchemy's API hosted on{" "}
                  {ALCHEMY_SUBGRAPH_URL}
                </p>
              </div>
              <AlchemySubgraphTrades
                limit={limit}
                refetchInterval={refetchInterval}
                enabled={isSourceActive(Tab.ALCHEMY_SUBGRAPH)}
              />
            </TabsContent>

            <TabsContent value={Tab.ALLIUM_WS}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Allium WebSocket</h3>
                <p className="text-sm text-muted-foreground">
                  This tab displays real-time trade data using Allium's WebSocket API at{" "}
                  <span className="font-mono text-xs">{ALLIUM_WS_URL}</span>.
                  The data is streamed in real-time from the Kafka consumer
                  which is monitoring blockchain events.
                </p>
              </div>
              <AlliumWSTrades />
            </TabsContent>
          </Tabs>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-muted-foreground text-center">Please enable data sources to view trades</p>
        </CardContent>
      )}
    </Card>
  );
};

export default TradeComparison;
