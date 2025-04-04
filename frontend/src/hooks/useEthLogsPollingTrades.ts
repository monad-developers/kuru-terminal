"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPublicClient, http, decodeEventLog, parseAbiItem } from 'viem';
import { MONAD_TESTNET_RPC_URL } from '@/src/config/env.config';
import { tradingPairs } from '@/src/config/trading-pairs.config';
import kuruOrderBookAbi from '@/src/config/abis/KuruOrderBook.json';
import { Trade } from '@/src/types/trade.interface';

export const useEthLogsPollingTrades = (): {
    trade: Trade | null;
    loading: boolean;
    error: string | null;
} => {
    // Store just a single trade - the latest one
    const [trade, setTrade] = useState<Trade | null>(null);
    const [latestBlock, setLatestBlock] = useState<bigint>(BigInt(0));
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Memoize contract addresses to prevent unnecessary recalculations
    const contractAddresses = useMemo(() =>
        tradingPairs.map(pair => pair.address as `0x${string}`),
        []  // Empty dependency array since tradingPairs is imported and won't change
    );

    const client = useMemo(() =>
        createPublicClient({
            transport: http(MONAD_TESTNET_RPC_URL),
        }),
        [] // Empty dependency array since RPC URL is imported and won't change
    );

    const tradeEventSignature = useMemo(() => parseAbiItem('event Trade(uint40 orderId, address makerAddress, bool isBuy, uint256 price, uint96 updatedSize, address takerAddress, address txOrigin, uint96 filledSize)'), []);

    // Function to fetch and process logs
    const fetchLogs = useCallback(async () => {
        try {
            let fromBlock: bigint;

            if (latestBlock === BigInt(0)) {
                // Initial fetch - get current block from chain and use it directly
                // We only want the latest events, not historical ones
                const currentBlock = await client.getBlockNumber();
                fromBlock = currentBlock - BigInt(3);
                console.log(`🔍 Initial fetch - starting from current block: ${fromBlock.toString()}`);
            } else {
                // For subsequent fetches, just increment our last processed block
                fromBlock = latestBlock + BigInt(1);
                console.log(`🔍 Subsequent fetch - from block: ${fromBlock.toString()}`);
            }

            // Fetch logs - always use 'latest' as toBlock to get all new blocks
            const logs = await client.getLogs({
                fromBlock,
                toBlock: 'latest',
                address: contractAddresses,
                event: tradeEventSignature
            });

            console.log(`📋 Found ${logs.length} logs in range ${fromBlock.toString()} to latest`);

            if (logs.length > 0) {
                // Find the log with the highest block number (most recent)
                const latestLog = logs.reduce((latest, current) =>
                    current.blockNumber > latest.blockNumber ? current : latest
                );

                console.log(`🔸 Latest log found at block ${latestLog.blockNumber.toString()}, tx: ${latestLog.transactionHash}`);

                // Decode log data using viem with the imported ABI
                const decodedLog = decodeEventLog({
                    abi: kuruOrderBookAbi,
                    data: latestLog.data,
                    topics: latestLog.topics,
                });

                const { isBuy, price, filledSize, makerAddress, takerAddress } =
                    decodedLog.args as unknown as {
                        orderId: bigint;
                        makerAddress: string;
                        isBuy: boolean;
                        price: bigint;
                        updatedSize: bigint;
                        takerAddress: string;
                        txOrigin: string;
                        filledSize: bigint;
                    };

                // Log decoded data
                console.log(`📊 Decoded Trade event:`, {
                    event: decodedLog.eventName,
                    blockNumber: latestLog.blockNumber.toString(),
                    isBuy,
                    price: price.toString(),
                    filledSize: filledSize.toString(),
                    makerAddress,
                    takerAddress,
                    allArgs: decodedLog.args
                });

                // Create a single Trade object for the latest event
                const latestTrade: Trade = {
                    id: `${latestLog.transactionHash}-${latestLog.logIndex}`,
                    blockHeight: Number(latestLog.blockNumber),
                    transactionHash: latestLog.transactionHash,
                    makerAddress,
                    isBuy,
                    price: price.toString(),
                    takerAddress,
                    filledSize: filledSize.toString(),
                };

                // Update with just the latest trade
                setTrade(latestTrade);

                // Update our latest block based on the event we received
                setLatestBlock(latestLog.blockNumber);
                console.log(`⏫ Updated latestBlock to: ${latestLog.blockNumber.toString()}`);
            } else {
                // No events found for this block range
                // Simply update our last processed block to be the fromBlock we just checked
                // This way, the next iteration will use fromBlock + 1
                setLatestBlock(fromBlock);
                console.log(`⚪ No events found. Updated latestBlock to: ${fromBlock.toString()}`);
            }

            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('❌ Error fetching eth_getLogs:', err);
            setError(`Error fetching eth_getLogs: ${err instanceof Error ? err.message : String(err)}`);
            setLoading(false);
        }
    }, [latestBlock, contractAddresses, client, tradeEventSignature]);

    // Set up polling
    useEffect(() => {
        // Set up polling interval
        const interval = setInterval(fetchLogs, 1000);

        // Clean up
        return () => {
            clearInterval(interval);
        };
    }, [fetchLogs]);

    return {
        trade,
        loading: loading && trade === null,
        error
    };
}; 