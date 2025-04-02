import axios from "axios";
import { db } from "../db/drizzle";
import { contractBlockTracker } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { InsightAPIResponse, RawLog, TradingPairsConfig } from "../types";
import { processEvents } from "./eventProcessor";
import tradingPairConfig from "../../config/trading-pairs.json";
import { MONAD_TESTNET_CHAIN_ID } from "../constants";
import { createLogger } from "../utils/logger.util";
import * as cron from 'node-cron';
import { convertIntervalToCronExpression } from "../utils/common.util";

// Create logger for this module
const logger = createLogger('Indexer');

// thirdweb insight API base URL
const API_BASE_URL = `https://${MONAD_TESTNET_CHAIN_ID}.insight.thirdweb.com/v1/events`;
// thirdweb insight API client ID
const CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;

// Validate that the client ID is set
if (!CLIENT_ID) {
  throw new Error("THIRDWEB_CLIENT_ID is not set");
}

// Store reference to the cron task so we can stop it if needed
let indexerTask: cron.ScheduledTask | null = null;
// Flag to track if an indexer run is currently in progress
let isIndexerRunning = false;
// Flag to indicate shutdown is requested
let isShutdownRequested = false;

// Load trading pairs configuration
export function getTradingPairs(): TradingPairsConfig {
  return tradingPairConfig as TradingPairsConfig;
}

// Get last indexed blocks for multiple contracts at once
async function getLastIndexedBlocksForContracts(contractAddresses: string[]): Promise<Map<string, number>> {
  try {
    // Create a map to store contract address -> last indexed block
    const blocksMap = new Map<string, number>();
    
    // Get all tracked contracts from database
    const result = await db.select().from(contractBlockTracker).where(
      eq(contractBlockTracker.chain_id, MONAD_TESTNET_CHAIN_ID.toString())
    );
    
    // Create a map of existing records for easy lookup
    const existingRecords = new Map<string, typeof result[0]>();
    for (const record of result) {
      existingRecords.set(record.contract_address.toLowerCase(), record);
    }
    
    // Process each contract address
    const newRecords = [];
    
    for (const contractAddress of contractAddresses) {
      const lowerCaseAddress = contractAddress.toLowerCase();
      const existingRecord = existingRecords.get(lowerCaseAddress);
      
      if (existingRecord) {
        // Record exists, use its last_indexed_block
        blocksMap.set(contractAddress, existingRecord.last_indexed_block || 0);
        logger.debug(`Found last indexed block for contract ${contractAddress}: ${existingRecord.last_indexed_block}`);
      } else {
        // Record doesn't exist, create a new one
        const tradingPair = getTradingPairs().tradingPairs.find(pair => 
          pair.address.toLowerCase() === lowerCaseAddress
        );
        const defaultBlock = tradingPair?.startBlock || 0;
        
        logger.info(`No block tracker found for contract ${contractAddress}. Creating new entry with default block: ${defaultBlock}`);
        
        // Add to new records for batch insert
        newRecords.push({
          chain_id: MONAD_TESTNET_CHAIN_ID.toString(),
          contract_address: contractAddress,
          last_indexed_block: defaultBlock,
          contract_name: tradingPair?.name || "",
        });
        
        blocksMap.set(contractAddress, defaultBlock);
      }
    }
    
    // Execute batch insert if needed
    if (newRecords.length > 0) {
      logger.debug(`Batch inserting ${newRecords.length} new contract block trackers`);
      await db.insert(contractBlockTracker).values(newRecords);
    }
    
    return blocksMap;
  } catch (error) {
    logger.error(`Error getting last indexed blocks for contracts:`, error);
    
    // Return a map with default value 0 for all requested contracts
    return new Map(contractAddresses.map(address => [address, 0]));
  }
}

// Batch update last indexed blocks for multiple contracts
async function updateLastIndexedBlocksForContracts(updates: Array<{contractAddress: string, blockNumber: number}>): Promise<void> {
  if (updates.length === 0) {
    return;
  }
  
  try {
    // Log the updates
    for (const update of updates) {
      logger.info(`Advancing block pointer for contract ${update.contractAddress} to ${update.blockNumber}`);
    }
    
    // Use transaction for batch updates
    await db.transaction(async (tx) => {
      for (const { contractAddress, blockNumber } of updates) {
        await tx
          .update(contractBlockTracker)
          .set({
            last_indexed_block: blockNumber,
            last_updated: new Date(),
          })
          .where(
            and(
              eq(contractBlockTracker.chain_id, MONAD_TESTNET_CHAIN_ID.toString()),
              eq(contractBlockTracker.contract_address, contractAddress)
            )
          );
      }
    });
    
    logger.info(`Successfully updated last indexed blocks for ${updates.length} contracts`);
  } catch (error) {
    logger.error(`Error batch updating last indexed blocks:`, error);
  }
}

// Fetch events for a specific contract address
async function fetchEvents(contractAddress: string, fromBlock: number): Promise<RawLog[]> {
  try {
    let allEvents: RawLog[] = [];
    let currentPage = 0;
    let hasMoreData = true; // Flag to control pagination loop
    const pageLimit = 100; // Maximum events per page
    const MAX_PAGES = 10; // Safety limit to prevent stack memory overflow

    // Track events for deduplication (hash+address+topics)
    const seenEvents = new Set<string>();

    logger.info(`Fetching events for contract ${contractAddress} from block ${fromBlock}`);

    // Fetch all pages of events
    // As 'total_pages' is not returned by the API, we rely on 504 Gateway Timeout to detect end of data
    while (hasMoreData && currentPage < MAX_PAGES) {
      const url = `${API_BASE_URL}/${contractAddress}`;
      logger.debug(`Fetching page ${currentPage} from API: ${url}`);

      try {
        const response = await axios.get<InsightAPIResponse>(url, {
          headers: {
            "X-Client-Id": CLIENT_ID,
          },
          params: {
            chain: MONAD_TESTNET_CHAIN_ID,
            /* 
              Note: 
                - We use gte not gt to include events from the last indexed block.
                - This is to ensure we don't miss any events.
            */
            filter_block_number_gte: fromBlock,
            decode: true,
            limit: pageLimit,
            page: currentPage,
            sort_by: 'block_number',
            sort_order: 'asc',
          },
          timeout: 60000,
        });

        // Extract data from response
        const { data } = response.data;

        if (data && data.length > 0) {
          // Filter out duplicates
          const newEvents = data.filter(event => {
            // Create a unique key for each event: hash + address + topics
            const eventKey = `${event.transaction_hash}:${event.address}:${event.topics.join(',')}`;

            if (seenEvents.has(eventKey)) {
              return false; // Skip duplicates
            }

            seenEvents.add(eventKey);
            return true;
          });

          // TODO: Might be some bug here

          allEvents = [...allEvents, ...newEvents];
          logger.info(`Fetched page ${currentPage} for contract ${contractAddress}: ${data.length} events (${newEvents.length} new, ${data.length - newEvents.length} duplicates)`);

          // Move to next page
          currentPage++;

          // If we get fewer events than the page limit, we've likely reached the end
          if (data.length < pageLimit) {
            logger.debug(`Received fewer events (${data.length}) than page limit (${pageLimit}). Assuming no more data.`);
            hasMoreData = false;
          }
        } else {
          // No data returned, we've reached the end
          logger.debug(`No events returned for page ${currentPage}. Stopping pagination.`);
          hasMoreData = false;
        }
      } catch (error: any) {
        // Check if this is a timeout error (504), which indicates no more data
        if (error.response && error.response.status === 504) {
          logger.debug(`Received 504 Gateway Timeout. This indicates no more data is available.`);
          hasMoreData = false;
        } else if (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500)) {
          // Server error or timeout, treat as end of data
          logger.warn(`Received server error or timeout for page ${currentPage}. Stopping pagination. Error: ${error.message}`);
          hasMoreData = false;
        } else {
          // Unexpected error, log and rethrow
          logger.error(`Error fetching events for contract ${contractAddress} on page ${currentPage}:`, error);
          
          // Sleep on error to handle rate limiting
          logger.info(`Sleeping for 3 seconds before retrying due to error...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          throw error;
        }
      }
    }

    // Check if we hit the safety limit
    if (currentPage >= MAX_PAGES) {
      logger.warn(`Reached maximum page limit (${MAX_PAGES}) for contract ${contractAddress}. Some data may be missing.`);
    }

    logger.info(`Completed fetching all ${allEvents.length} events for contract ${contractAddress} from block ${fromBlock}`);
    return allEvents;
  } catch (error) {
    logger.error(`Error fetching events for contract ${contractAddress}:`, error);
    return [];
  }
}

// Main function to run the indexer
export async function runIndexer(): Promise<void> {
  // Check if indexer is already running
  if (isIndexerRunning) {
    logger.info("Indexer is already running. Skipping this run.");
    return;
  }

  // Don't start a new run if shutdown is requested
  if (isShutdownRequested) {
    logger.info("Shutdown requested, skipping indexer run");
    return;
  }

  try {
    // Set the flag to indicate that indexer is now running
    isIndexerRunning = true;

    logger.info(`========== Indexer Run Started ==========`);
    const tradingPairs = getTradingPairs().tradingPairs;
    if (tradingPairs.length === 0) {
      logger.error("No trading pairs configured. Exiting indexer.");
      return;
    }

    logger.info(`Indexing ${tradingPairs.length} trading pairs`);
    
    // Extract all contract addresses
    const contractAddresses = tradingPairs.map(pair => pair.address);
    
    // Fetch all last indexed blocks in one DB call
    logger.info(`Fetching last indexed blocks for ${contractAddresses.length} contracts`);
    const lastIndexedBlocks = await getLastIndexedBlocksForContracts(contractAddresses);
    
    // Prepare parallel fetch tasks
    const fetchTasks: Array<{
      contractAddress: string;
      contractName: string;
      lastIndexedBlock: number;
    }> = [];
    
    for (const pair of tradingPairs) {
      const contractAddress = pair.address;
      const contractName = pair.name;
      const lastIndexedBlock = lastIndexedBlocks.get(contractAddress) || 0;
      
      logger.info(`Preparing to fetch events for ${contractName} (${contractAddress}) from block ${lastIndexedBlock}`);
      
      fetchTasks.push({
        contractAddress,
        contractName,
        lastIndexedBlock
      });
    }
    
    // Execute all fetch tasks in parallel
    logger.info(`Starting parallel fetch for ${fetchTasks.length} contracts`);
    
    const fetchResults = await Promise.all(
      fetchTasks.map(async task => {
        try {
          const events = await fetchEvents(task.contractAddress, task.lastIndexedBlock);
          
          if (events.length > 0) {
            // Find the highest block number in the events for this contract
            let maxBlockForContract = task.lastIndexedBlock;
            for (const event of events) {
              const blockNumber = event.block_number;
              if (blockNumber > maxBlockForContract) {
                maxBlockForContract = blockNumber;
              }
            }
            
            return {
              contractAddress: task.contractAddress,
              contractName: task.contractName,
              lastIndexedBlock: task.lastIndexedBlock,
              maxBlockForContract,
              events
            };
          } else {
            logger.info(`No new events found for contract ${task.contractAddress}`);
            return {
              contractAddress: task.contractAddress,
              contractName: task.contractName,
              lastIndexedBlock: task.lastIndexedBlock,
              maxBlockForContract: task.lastIndexedBlock,
              events: []
            };
          }
        } catch (error) {
          logger.error(`Error in parallel fetch for contract ${task.contractAddress}:`, error);
          // Return empty events if error
          return {
            contractAddress: task.contractAddress,
            contractName: task.contractName,
            lastIndexedBlock: task.lastIndexedBlock,
            maxBlockForContract: task.lastIndexedBlock,
            events: []
          };
        }
      })
    );
    
    // Flatten all events and collect block updates
    const allEvents = fetchResults.flatMap(result => result.events);
    const blockUpdates = fetchResults
      .filter(result => result.maxBlockForContract > result.lastIndexedBlock) // Only where block number increased
      .map(result => ({
        contractAddress: result.contractAddress,
        blockNumber: result.maxBlockForContract
      }));
    
    // Update all last indexed blocks in parallel
    if (blockUpdates.length > 0) {
      logger.info(`Updating last indexed blocks for ${blockUpdates.length} contracts`);
      await updateLastIndexedBlocksForContracts(blockUpdates);
    }

    if (allEvents.length > 0) {
      // Process and store events
      logger.info(`Processing ${allEvents.length} events for storage`);
      await processEvents(allEvents);
      logger.info(`Successfully processed ${allEvents.length} events`);
    } else {
      logger.info("No new events found in this indexer run.");
    }

    logger.info(`========== Indexer Run Completed ==========`);
  } catch (error) {
    logger.error("Error running indexer:", error);
  } finally {
    // Reset the flag regardless of success or failure
    isIndexerRunning = false;
  }
}

// Run the indexer on a schedule via CRON job
export function startIndexer(intervalMs: number = 5000): cron.ScheduledTask {
  logger.info(`Starting Kuru Indexer using thirdweb insight API. Interval: ${intervalMs}ms`);

  // Run immediately on start
  runIndexer();

  // Convert interval to cron expression
  const cronExpression = convertIntervalToCronExpression(intervalMs);
  logger.info(`Scheduling indexer with cron expression: ${cronExpression}`);

  // Schedule task with node-cron
  indexerTask = cron.schedule(cronExpression, () => {
    logger.debug(`Triggering scheduled indexer run via cron`);
    runIndexer();
  }, {
    scheduled: true
  });

  return indexerTask;
}

// Stop the indexer cron job
export function stopIndexer(): Promise<void> {
  return new Promise<void>((resolve) => {
    isShutdownRequested = true;
    
    if (indexerTask) {
      logger.info('Stopping indexer cron job');
      indexerTask.stop();
      indexerTask = null;
    }
    
    if (!isIndexerRunning) {
      logger.info('Indexer not running, shutdown complete');
      resolve();
      return;
    }
    
    logger.info('Waiting for in-progress indexer run to complete...');
    
    // Check every 100ms if the indexer has finished running
    const checkInterval = setInterval(() => {
      if (!isIndexerRunning) {
        clearInterval(checkInterval);
        logger.info('Indexer run completed, shutdown complete');
        resolve();
      }
    }, 100);
    
    // Add a timeout of 30 seconds to force shutdown if indexer is stuck
    setTimeout(() => {
      clearInterval(checkInterval);
      logger.warn('Forcing indexer shutdown after timeout');
      resolve();
    }, 30000);
  });
} 