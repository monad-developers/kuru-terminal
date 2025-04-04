"use client";

import { useMemo, useEffect } from "react";
import { useTrades, useApp } from "@/src/providers/AppProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tab } from "@/src/enums/tab.enum";

export default function IndexingServiceComparison() {
  const { setEnabled } = useApp();
  const {
    alliumTrades,
    goldskyMirrorTrades,
    quicknodeStreamTrades,
    thirdwebInsightTrades,
    alchemySubgraphTrades,
    goldskySubgraphTrades,
    theGraphSubgraphTrades,
    envioHyperIndexTrades,
    ponderTrades,
  } = useTrades();

  // Enable data fetching on mount, disable on unmount
  useEffect(() => {
    setEnabled(true);
    return () => {
      setEnabled(false);
    };
  }, [setEnabled]);

  const serviceData = useMemo(() => {
    const services = [
      { name: "Allium Data Stream", trades: alliumTrades, tab: Tab.ALLIUM_DATA_STREAM },
      { name: "Goldsky Mirror", trades: goldskyMirrorTrades, tab: Tab.GOLDSKY_MIRROR },
      { name: "Quicknode Stream", trades: quicknodeStreamTrades, tab: Tab.QUICKNODE_STREAM },
      { name: "Thirdweb Insight", trades: thirdwebInsightTrades, tab: Tab.THIRDWEB_INSIGHT },
      { name: "Alchemy Subgraph", trades: alchemySubgraphTrades, tab: Tab.ALCHEMY_SUBGRAPH },
      { name: "Goldsky Subgraph", trades: goldskySubgraphTrades, tab: Tab.GOLDSKY_SUBGRAPH },
      { name: "TheGraph Subgraph", trades: theGraphSubgraphTrades, tab: Tab.THEGRAPH_SUBGRAPH },
      { name: "Envio HyperIndex", trades: envioHyperIndexTrades, tab: Tab.ENVIO_HYPERINDEX },
      { name: "Ponder", trades: ponderTrades, tab: Tab.PONDER },
    ];

    // Get the latest block from each service
    const servicesWithLatestBlock = services.map(service => {
      const latestTrade = service.trades.length > 0 
        ? service.trades.reduce((latest, current) => 
            latest.blockHeight > current.blockHeight ? latest : current
          )
        : null;
      
      return {
        ...service,
        latestBlock: latestTrade?.blockHeight || 0,
        hasData: Boolean(latestTrade)
      };
    });

    // Find max and min block numbers among services that have data
    const servicesWithData = servicesWithLatestBlock.filter(s => s.hasData);
    const maxBlock = Math.max(...servicesWithData.map(s => s.latestBlock));
    const minBlock = Math.min(...servicesWithData.map(s => s.latestBlock));

    return servicesWithLatestBlock.map(service => ({
      ...service,
      isNewest: service.latestBlock === maxBlock && service.hasData,
      isOldest: service.latestBlock === minBlock && service.hasData
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
  ]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indexing Service</TableHead>
            <TableHead>Latest Block</TableHead>
            <TableHead>Latency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceData.map((service) => (
            <TableRow key={service.name}>
              <TableCell className="font-medium">{service.name}</TableCell>
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
                  {service.hasData ? service.latestBlock.toLocaleString() : "No data"}
                </span>
              </TableCell>
              <TableCell>TBD</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 