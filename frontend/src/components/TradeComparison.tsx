"use client";

import EnvioHyperIndexTrades from "@/src/components/EnvioHyperIndexTrades";
import PonderTrades from "@/src/components/PonderTrades";
import TheGraphSubgraphTrades from "@/src/components/TheGraphSubgraphTrades";
import GoldskySubgraphTrades from "@/src/components/GoldskySubgraphTrades";
import AlchemySubgraphTrades from "./AlchemySubgraphTrades";
import AlliumDataStreamTrades from "./AlliumDataStreamTrades";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Slider } from "@/src/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  ENVIO_HYPERINDEX_API_URL,
  PONDER_GRAPHQL_API_URL,
  THEGRAPH_SUBGRAPH_URL,
  GOLDSKY_SUBGRAPH_URL,
  ALCHEMY_SUBGRAPH_URL,
  ALLIUM_WS_URL,
  GOLDSKY_MIRROR_WS_URL,
  QUICKNODE_STREAM_WS_URL,
  THIRDWEB_INSIGHT_API_URL,
} from "@/src/config/env.config";
import { Tab } from "@/src/enums/tab.enum";
import { useApp } from "@/src/providers/AppProvider";
import GoldskyMirrorTrades from "./GoldskyMirrorTrades";
import QuicknodeStreamTrades from "./QuicknodeStreamTrades";
import ThirdwebInsightTrades from "./ThirdwebInsightTrades";

const TradeComparison = () => {
  const {
    activeTab,
    setActiveTab,
    refetchInterval,
    setRefetchInterval,
    enabled,
    setEnabled,
    limit,
    setLimit
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
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 border rounded-md p-2.5 bg-muted/20 h-[72px]">
              <span className="text-sm font-medium whitespace-nowrap mr-2">
                Data Sources
              </span>
              <Button 
                size="sm" 
                variant={enabled ? "default" : "outline"}
                onClick={() => setEnabled(!enabled)}
              >
                {enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            
            <div className="border rounded-md p-2.5 bg-muted/20 h-[72px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">Poll Interval</span>
                <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                  {refetchInterval / 1000}s
                </span>
              </div>
              <div className="w-36 mt-1.5">
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
            
            <div className="border rounded-md p-2.5 bg-muted/20 h-[72px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Limit</span>
                <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                  {limit}
                </span>
              </div>
              <div className="w-36 mt-1.5">
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
                  Ponder
                </TabsTrigger>
                <TabsTrigger value={Tab.ENVIO_HYPERINDEX}>
                  Envio
                </TabsTrigger>
                <TabsTrigger value={Tab.THIRDWEB_INSIGHT}>
                  Thirdweb Insight
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
                <TabsTrigger value={Tab.ALLIUM_DATA_STREAM}>
                  Allium Data Stream
                </TabsTrigger>
                <TabsTrigger value={Tab.GOLDSKY_MIRROR}>
                  Goldsky Mirror
                </TabsTrigger>
                <TabsTrigger value={Tab.QUICKNODE_STREAM}>
                  Quicknode Stream
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={Tab.PONDER}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Ponder</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data using ponder's GraphQL API hosted on{" "}
                  <a href={PONDER_GRAPHQL_API_URL} className="underline">
                    {PONDER_GRAPHQL_API_URL}
                  </a>
                  . Check out <code>./indexer/README.md</code> for more
                  information on how to run the indexer.
                </p>
              </div>
              <PonderTrades />
            </TabsContent>

            <TabsContent value={Tab.ENVIO_HYPERINDEX}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Envio</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data using Envio's GraphQL API hosted on{" "}
                  <a href={ENVIO_HYPERINDEX_API_URL} className="underline">
                    {ENVIO_HYPERINDEX_API_URL}
                  </a>
                  . Check out <code>./envio/README.md</code> for more information
                  on how to run the indexer.
                </p>
              </div>
              <EnvioHyperIndexTrades />
            </TabsContent>

            <TabsContent value={Tab.THIRDWEB_INSIGHT}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">thirdweb Insight</h3>
                <p className="text-sm  text-muted-foreground">
                  This tab fetches trade data using thirdweb Insight's API hosted on{" "}
                  <a href={THIRDWEB_INSIGHT_API_URL} className="underline">
                    {THIRDWEB_INSIGHT_API_URL}
                  </a>
                </p>
              </div>
              <ThirdwebInsightTrades />
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
              <TheGraphSubgraphTrades />
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
              <GoldskySubgraphTrades />
            </TabsContent>

            <TabsContent value={Tab.ALCHEMY_SUBGRAPH}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Alchemy Subgraph</h3>
                <p className="text-sm  text-muted-foreground">
                  This tab fetches trade data using Alchemy's API hosted on{" "}
                  {ALCHEMY_SUBGRAPH_URL}
                </p>
              </div>
              <AlchemySubgraphTrades />
            </TabsContent>

            <TabsContent value={Tab.ALLIUM_DATA_STREAM}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Allium Data Stream</h3>
                <p className="text-sm text-muted-foreground">
                  This tab displays real-time trade data from Allium's Data Stream via a WebSocket connection at{" "}
                  <span className="font-mono text-xs">{ALLIUM_WS_URL}</span>.
                  The data is streamed in real-time from the Kafka consumer
                  which is monitoring blockchain events.
                </p>
              </div>
              <AlliumDataStreamTrades />
            </TabsContent>

            <TabsContent value={Tab.GOLDSKY_MIRROR}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Goldsky Mirror</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data from Goldsky's Mirror pipeline via a WebSocket connection at{" "}
                  <span className="font-mono text-xs">{GOLDSKY_MIRROR_WS_URL}</span>.
                </p>
              </div>
              <GoldskyMirrorTrades />
            </TabsContent>

            <TabsContent value={Tab.QUICKNODE_STREAM}>
              <div className="mb-4 p-4 bg-muted/40 rounded-md">
                <h3 className="font-medium mb-1">Quicknode Stream</h3>
                <p className="text-sm text-muted-foreground">
                  This tab fetches trade data from Quicknode's Stream pipeline via a WebSocket connection at{" "}
                  <span className="font-mono text-xs">{QUICKNODE_STREAM_WS_URL}</span>.
                </p>
              </div>
              <QuicknodeStreamTrades />
            </TabsContent>
          </Tabs>
        </CardContent>
      ) : (
        <CardContent>
          <div className="py-8 flex flex-col items-center justify-center border border-dashed rounded-md bg-muted/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-muted-foreground mb-3"
            >
              <path d="M12 2v1" />
              <path d="M12 21v1" />
              <path d="m4.6 4.6.7.7" />
              <path d="m18.7 18.7.7.7" />
              <path d="M2 12h1" />
              <path d="M21 12h1" />
              <path d="m4.6 19.4.7-.7" />
              <path d="m18.7 5.3.7-.7" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <p className="text-muted-foreground text-center text-lg">Activate data sources to view trade information</p>
            <Button 
              onClick={() => setEnabled(true)} 
              className="mt-4"
              variant="outline"
            >
              Enable Data Sources
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TradeComparison;
