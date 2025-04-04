"use client";

import { useMemo, useEffect } from "react";
import { useTrades, useApp } from "@/src/providers/AppProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tab } from "@/src/enums/tab.enum";
import { Trade } from "@/src/types/trade.interface";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { useEthLogsPollingTrades } from "../hooks/useEthLogsPollingTrades";

interface ServiceData {
    name: string;
    trades: Trade[];
    tab: Tab;
    latestBlock: number;
    hasData: boolean;
}

interface ProcessedServiceData extends ServiceData {
    isNewest: boolean;
    isOldest: boolean;
    blockDiff: number | null;
}

export default function IndexingServiceComparison() {
    const {
        setEnabled,
        setLimit,
        setRefetchInterval,
        alliumTrades,
        goldskyMirrorTrades,
        quicknodeStreamTrades,
        thirdwebInsightTrades,
        alchemySubgraphTrades,
        goldskySubgraphTrades,
        theGraphSubgraphTrades,
        envioHyperIndexTrades,
        ponderTrades
    } = useApp();

    const {
        trade: ethLogsTrade,
        loading: ethLogsLoading,
        error: ethLogsError
    } = useEthLogsPollingTrades();

    // Enable data fetching on mount, disable on unmount
    useEffect(() => {
        setEnabled(true);
        // Limit to 1 trade to get the latest block
        setLimit(1);
        setRefetchInterval(1000);
        return () => {
            setEnabled(false);
        };
    }, [setEnabled]);

    const serviceData = useMemo<ProcessedServiceData[]>(() => {
        const benchmarkBlock = ethLogsTrade?.blockHeight || 0;

        const services: ServiceData[] = [
            { name: "Allium Data Stream", trades: alliumTrades, tab: Tab.ALLIUM_DATA_STREAM, latestBlock: 0, hasData: false },
            { name: "Goldsky Mirror", trades: goldskyMirrorTrades, tab: Tab.GOLDSKY_MIRROR, latestBlock: 0, hasData: false },
            { name: "Quicknode Stream", trades: quicknodeStreamTrades, tab: Tab.QUICKNODE_STREAM, latestBlock: 0, hasData: false },
            { name: "Thirdweb Insight", trades: thirdwebInsightTrades, tab: Tab.THIRDWEB_INSIGHT, latestBlock: 0, hasData: false },
            { name: "Alchemy Subgraph", trades: alchemySubgraphTrades, tab: Tab.ALCHEMY_SUBGRAPH, latestBlock: 0, hasData: false },
            { name: "Goldsky Subgraph", trades: goldskySubgraphTrades, tab: Tab.GOLDSKY_SUBGRAPH, latestBlock: 0, hasData: false },
            { name: "TheGraph Subgraph", trades: theGraphSubgraphTrades, tab: Tab.THEGRAPH_SUBGRAPH, latestBlock: 0, hasData: false },
            { name: "Envio HyperIndex", trades: envioHyperIndexTrades, tab: Tab.ENVIO_HYPERINDEX, latestBlock: 0, hasData: false },
            { name: "Ponder", trades: ponderTrades, tab: Tab.PONDER, latestBlock: 0, hasData: false },
        ];

        // Get the latest block from each service
        const servicesWithLatestBlock: ServiceData[] = services.map(service => {
            if (service.trades.length === 0) {
                return { ...service, hasData: false, latestBlock: 0 };
            }

            const latestTrade = service.trades.reduce((latest, current) =>
                latest.blockHeight > current.blockHeight ? latest : current
            );

            return {
                ...service,
                latestBlock: latestTrade.blockHeight,
                hasData: true
            };
        });

        // Find services with data
        const servicesWithData = servicesWithLatestBlock.filter(s => s.hasData);

        if (servicesWithData.length === 0) {
            return servicesWithLatestBlock.map(s => ({
                ...s,
                isNewest: false,
                isOldest: false,
                blockDiff: null
            }));
        }

        // Get distinct block heights to find the latest and oldest
        const blockHeights = [...new Set(servicesWithData.map(s => s.latestBlock))].sort((a, b) => b - a);
        const maxBlock = blockHeights[0]; // Highest block
        const minBlock = blockHeights[blockHeights.length - 1]; // Lowest block

        return servicesWithLatestBlock.map(service => ({
            ...service,
            isNewest: service.hasData && service.latestBlock === maxBlock,
            // Only mark as oldest if there's a difference in block heights
            isOldest: service.hasData && service.latestBlock === minBlock && maxBlock !== minBlock,
            // Calculate difference from benchmark
            blockDiff: service.hasData && benchmarkBlock > 0 ? service.latestBlock - benchmarkBlock : null
        }));
    }, [
        alliumTrades,
        goldskyMirrorTrades,
        quicknodeStreamTrades,
        thirdwebInsightTrades,
        alchemySubgraphTrades,
        goldskySubgraphTrades,
        theGraphSubgraphTrades,
        envioHyperIndexTrades,
        ponderTrades,
        ethLogsTrade
    ]);

    // Get services with latest and oldest blocks for the status cards
    const newestServices = serviceData.filter(service => service.isNewest);
    const oldestServices = serviceData.filter(service => service.isOldest);

    // Function to render the block difference indicator
    const renderBlockDiff = (diff: number | null) => {
        if (diff === null) return null;

        if (diff === 0) {
            return (
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md">
                    In sync
                </span>
            );
        } else if (diff > 0) {
            return (
                <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md">
                    +{diff.toLocaleString()}
                </span>
            );
        } else {
            return (
                <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                    {diff.toLocaleString()}
                </span>
            );
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                {/* Fastest Indexers Card */}
                <Card className="border-green-500 border-t-4 min-h-[240px]">
                    <CardHeader>
                        <CardTitle>Fastest Indexers</CardTitle>
                        <CardDescription>
                            Services with the most up-to-date data, providing the quickest data refresh rates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {newestServices.length > 0 ? (
                            <div>
                                <p className="font-semibold mb-2">
                                    Most Recent Block: <span className="text-green-500">{newestServices[0].latestBlock.toLocaleString()}</span>
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {newestServices.map(service => (
                                        <div key={service.name} className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                                            {service.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p>No services with data available</p>
                        )}
                    </CardContent>
                </Card>

                {/* Slowest Indexers Card */}
                <Card className="border-red-500 border-t-4 min-h-[240px]">
                    <CardHeader>
                        <CardTitle>Lagging Indexers</CardTitle>
                        <CardDescription>
                            Services with slower data refresh rates, currently behind the latest block data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {oldestServices.length > 0 ? (
                            <div>
                                <p className="font-semibold mb-2">
                                    Behind at Block: <span className="text-red-500">{oldestServices[0].latestBlock.toLocaleString()}</span>
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {oldestServices.map(service => (
                                        <div key={service.name} className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                                            {service.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="h-14 flex items-center">All services are synced to the same block height</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/5">Indexing Service</TableHead>
                        <TableHead className="w-1/5">Latest Block</TableHead>
                        <TableHead className="w-1/5">Block Difference (vs Benchmark)</TableHead>
                        <TableHead className="w-1/5">Latency</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* ETH Logs Polling - Benchmark */}
                    <TableRow className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500">
                        <TableCell className="font-medium font-bold">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-md">BENCHMARK</span>
                                Direct RPC Polling (eth_getLogs)
                            </div>
                        </TableCell>
                        <TableCell className="font-bold">{ethLogsTrade?.blockHeight.toLocaleString() || "No Data"}</TableCell>
                        <TableCell className="font-bold">—</TableCell>
                        <TableCell className="font-bold">TBD</TableCell>
                    </TableRow>

                    {serviceData.map((service) => (
                        <TableRow key={service.name}>
                            <TableCell className="font-medium truncate">{service.name}</TableCell>
                            <TableCell>
                                <span
                                    className={
                                        service.isNewest
                                            ? "text-green-500 font-bold"
                                            : service.isOldest
                                                ? "text-red-500 font-bold"
                                                : ""
                                    }
                                >
                                    {service.hasData ? service.latestBlock.toLocaleString() : "No Data"}
                                </span>
                            </TableCell>
                            <TableCell>
                                {service.hasData ? renderBlockDiff(service.blockDiff) : "No Data"}
                            </TableCell>
                            <TableCell>TBD</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 