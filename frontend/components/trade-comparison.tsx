"use client";

import { TradeTable } from "@/components/trade-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trade } from "@/db/types";
import { getTradesFromPostgres } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

enum TAB {
  GRAPHQL = "graphql",
  POSTGRES = "postgres",
  ENVIO = "envio",
}

export function TradeComparison() {
  const [activeTab, setActiveTab] = useState<TAB>(TAB.GRAPHQL);
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
          defaultValue={TAB.GRAPHQL}
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value={TAB.GRAPHQL}>GraphQL</TabsTrigger>
              <TabsTrigger value={TAB.POSTGRES}>Postgres</TabsTrigger>
              <TabsTrigger value={TAB.ENVIO}>Envio</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={TAB.GRAPHQL}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Ponder GraphQL Data Fetching</h3>
              <p className="text-sm text-muted-foreground">
                This tab fetches trade data using ponder's GraphQL API hosted on{" "}
                <a href="http://localhost:42069">localhost:42069</a>. Check out{" "}
                <code>./indexer/README.md</code> for more information on how to
                run the indexer.
              </p>
            </div>
            <PonderGraphQlTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.GRAPHQL && enabled}
            />
          </TabsContent>

          <TabsContent value={TAB.POSTGRES}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Postgres Direct Query</h3>
              <p className="text-sm text-muted-foreground">
                This tab fetches trade data directly from the Postgres database
                using SQL queries. It can be more efficient for complex queries
                or when you need full SQL capabilities.
              </p>
            </div>
            <PostgresTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.POSTGRES && enabled}
            />
          </TabsContent>

          <TabsContent value={TAB.ENVIO}>
            <div className="mb-4 p-4 bg-muted/40 rounded-md">
              <h3 className="font-medium mb-1">Envio GraphQL Data Fetching</h3>
              <p className="text-sm text-muted-foreground">
                This tab fetches trade data using Envio's GraphQL API hosted on{" "}
                <a href="http://localhost:8080">localhost:8080</a>. Check out{" "}
                <code>./envio/README.md</code> for more information on how to
                run the indexer.
              </p>
            </div>
            <EnvioGraphQlTrades
              limit={limit}
              refetchInterval={refetchInterval}
              enabled={activeTab === TAB.ENVIO && enabled}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

async function getTradesFromGraphQL(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch("http://localhost:42069/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      query: `
          query Trades {
            trades(limit: ${limit}, orderBy: "blockHeight", orderDirection: "desc") {
              items {
                blockHeight
                filledSize
                id
                isBuy
                orderId
                makerAddress
                price
                takerAddress
                updatedSize
                txOrigin
              }
            }
          }
        `,
    }),
  });

  const data = await response.json();
  return data.data.trades.items;
}

function PonderGraphQlTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["graphql-trades", limit],
    queryFn: ({ signal }) => getTradesFromGraphQL(limit, signal),
    refetchInterval,
    enabled,
  });

  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

export async function getTradesFromEnvio(
  limit: number,
  signal?: AbortSignal
): Promise<Trade[]> {
  const response = await fetch("http://localhost:8080/v1/graphql", {
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": "testing",
    },
    body: JSON.stringify({
      query: `{
        Kuru_Trade(order_by: {blockHeight: desc}, limit: ${limit}) {
          db_write_timestamp
          filledSize
          id
          isBuy
          makerAddress
          orderId
          takerAddress
          price
          txOrigin
          updatedSize
          blockHeight
        }
      }`,
    }),
    method: "POST",
    signal,
  });

  const data = await response.json();
  return data.data.Kuru_Trade;
}

function EnvioGraphQlTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["envio-trades", limit],
    queryFn: ({ signal }) => getTradesFromEnvio(limit, signal),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}

function PostgresTrades({
  limit,
  refetchInterval,
  enabled,
}: {
  limit: number;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["postgres-trades", limit],
    queryFn: () => getTradesFromPostgres(limit),
    refetchInterval,
    enabled,
  });
  return <TradeTable trades={data ?? []} isLoading={enabled && isPending} />;
}
