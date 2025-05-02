import axios from "axios";
import { db } from "../db/drizzle";
import { contractBlockTracker } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { InsightAPIResponse, RawLog, TradingPairsConfig } from "../types";
import { EventProcessor } from "./event-processor.service";
import tradingPairConfig from "../../config/trading-pairs.json";
import { MONAD_TESTNET_CHAIN_ID } from "../constants";
import { createLogger } from "../utils/logger.util";
import * as cron from 'node-cron';
import { convertIntervalToCronExpression } from "../utils/common.util";

/**
 * IndexerService class responsible for polling the thirdweb insight API
 * and coordinating event processing.
 * 
 * Core responsibilities:
 * 1. Polling thirdweb insight API for new events
 * 2. Managing contract block tracking
 * 3. Coordinating with EventProcessor for event handling
 * 4. Managing indexer lifecycle (start, stop, scheduling)
 */
export class IndexerService {
  private readonly logger = createLogger('Indexer');
  private readonly API_BASE_URL: string = `https://${MONAD_TESTNET_CHAIN_ID}.insight.thirdweb.com/v1/events`;
  private readonly POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL || '1000');
  private readonly CLIENT_ID: string;
  
  private indexerTask: cron.ScheduledTask | null = null;
  private isIndexerRunning: boolean = false;
  private isShutdownRequested: boolean = false;
  private eventProcessor: EventProcessor | null = null;

  constructor() {
    this.CLIENT_ID = process.env.THIRDWEB_CLIENT_ID || '';

    if (!this.CLIENT_ID) {
      throw new Error("THIRDWEB_CLIENT_ID environment variable is not set");
    }
  }

  /**
   * Get configured trading pairs
   */
  private getTradingPairs(): TradingPairsConfig {
    return tradingPairConfig as TradingPairsConfig;
  }

  /**
   * Get last indexed blocks for multiple contracts
   */
  private async getLastIndexedBlocksForContracts(contractAddresses: string[]): Promise<Map<string, number>> {
    try {
      const blocksMap = new Map<string, number>();
      const result = await db.select().from(contractBlockTracker);
      const existingRecords = new Map(
        result.map(record => [record.contract_address.toLowerCase(), record])
      );

      const newRecords = [];

      for (const contractAddress of contractAddresses) {
        const lowerCaseAddress = contractAddress.toLowerCase();
        const existingRecord = existingRecords.get(lowerCaseAddress);

        if (existingRecord) {
          blocksMap.set(contractAddress, existingRecord.last_indexed_block || 0);
          this.logger.debug(`Found last indexed block for contract ${contractAddress}: ${existingRecord.last_indexed_block}`);
        } else {
          const tradingPair = this.getTradingPairs().tradingPairs.find(pair =>
            pair.address.toLowerCase() === lowerCaseAddress
          );
          const defaultBlock = tradingPair?.startBlock || 0;

          this.logger.info(`No block tracker found for contract ${contractAddress}. Creating new entry with default block: ${defaultBlock}`);

          newRecords.push({
            chain_id: MONAD_TESTNET_CHAIN_ID.toString(),
            contract_address: contractAddress,
            last_indexed_block: defaultBlock,
            contract_name: tradingPair?.name || "",
          });

          blocksMap.set(contractAddress, defaultBlock);
        }
      }

      if (newRecords.length > 0) {
        this.logger.debug(`Batch inserting ${newRecords.length} new contract block trackers`);
        await db.insert(contractBlockTracker).values(newRecords);
      }

      return blocksMap;
    } catch (error) {
      this.logger.error(`Error getting last indexed blocks for contracts:`, error);
      return new Map(contractAddresses.map(address => [address, 0]));
    }
  }

  /**
   * Update last indexed blocks for multiple contracts
   */
  private async updateLastIndexedBlocksForContracts(updates: Array<{ contractAddress: string, blockNumber: number }>): Promise<void> {
    if (updates.length === 0) return;

    try {
      for (const update of updates) {
        this.logger.info(`Advancing block pointer for contract ${update.contractAddress} to ${update.blockNumber}`);
      }

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
                eq(contractBlockTracker.contract_address, contractAddress)
              )
            );
        }
      });

      this.logger.info(`Successfully updated last indexed blocks for ${updates.length} contracts`);
    } catch (error) {
      this.logger.error(`Error batch updating last indexed blocks:`, error);
      throw error;
    }
  }

  /**
   * Fetch events for a specific contract
   */
  private async fetchEvents(contractAddress: string, fromBlock: number): Promise<RawLog[]> {
    try {
      let allEvents: RawLog[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      const STANDARD_MAX_PAGES = 8;
      const EXTENDED_MAX_PAGES = 30;
      let maxPages = STANDARD_MAX_PAGES;
      const pageLimit = 100;
      const seenEvents = new Set<string>();
      let highestBlockSeen = fromBlock;

      this.logger.info(`Fetching events for contract ${contractAddress} from block ${fromBlock}`);

      while (hasMoreData && currentPage < maxPages) {
        const url = `${this.API_BASE_URL}/${contractAddress}`;
        this.logger.debug(`Fetching page ${currentPage} from API: ${url}`);

        try {
          const response = await axios.get<InsightAPIResponse>(url, {
            headers: {
              "X-Client-Id": this.CLIENT_ID,
            },
            params: {
              chain: MONAD_TESTNET_CHAIN_ID,
              filter_block_number_gte: fromBlock,
              decode: true,
              limit: pageLimit,
              page: currentPage,
              sort_by: 'block_number',
              sort_order: 'asc',
            },
            timeout: 60000,
          });

          const { data } = response.data;

          if (data && data.length > 0) {
            const newEvents: RawLog[] = [];
            for (const event of data) {
              if (event.block_number > highestBlockSeen) {
                highestBlockSeen = event.block_number;
              }

              const eventKey = `${event.transaction_hash}:${event.log_index}`;
              if (!seenEvents.has(eventKey)) {
                seenEvents.add(eventKey);
                newEvents.push(event);
              }
            }

            const duplicationRatio = data.length > 0 ? (data.length - newEvents.length) / data.length : 0;

            allEvents = [...allEvents, ...newEvents];
            this.logger.info(`Fetched page ${currentPage} for contract ${contractAddress}: ${data.length} events (${newEvents.length} new, ${data.length - newEvents.length} duplicates, ${Math.round(duplicationRatio * 100)}% duplication)`);

            if (currentPage >= STANDARD_MAX_PAGES - 1 && highestBlockSeen === fromBlock && seenEvents.size < 5) {
              if (maxPages === STANDARD_MAX_PAGES) {
                maxPages = EXTENDED_MAX_PAGES;
                this.logger.warn(`Detected potential block stagnation at block ${fromBlock} for contract ${contractAddress}. Only ${seenEvents.size} unique events found after ${STANDARD_MAX_PAGES} pages. Extending pagination limit to ${EXTENDED_MAX_PAGES} pages to search for higher blocks.`);
              }
            }

            currentPage++;

            if (data.length < pageLimit) {
              this.logger.debug(`Received fewer events (${data.length}) than page limit (${pageLimit}). Assuming no more data.`);
              hasMoreData = false;
            }
          } else {
            this.logger.debug(`No events returned for page ${currentPage}. Stopping pagination.`);
            hasMoreData = false;
          }
        } catch (error: any) {
          if (error.response?.status === 504 || error.code === 'ECONNABORTED' || (error.response?.status >= 500)) {
            this.logger.warn(`Received server error or timeout for page ${currentPage}. Stopping pagination. Error: ${error.message}`);
            hasMoreData = false;
          } else {
            this.logger.error(`Error fetching events for contract ${contractAddress} on page ${currentPage}:`, error);
            await new Promise(resolve => setTimeout(resolve, 3000));
            throw error;
          }
        }
      }

      if (currentPage >= maxPages) {
        const maxPageType = maxPages === EXTENDED_MAX_PAGES ? 'extended' : 'standard';
        this.logger.warn(`Reached ${maxPageType} maximum page limit (${maxPages}) for contract ${contractAddress}. Highest block seen: ${highestBlockSeen}. Total unique events: ${seenEvents.size}.`);
      }

      this.logger.info(`Completed fetching all ${allEvents.length} events for contract ${contractAddress} from block ${fromBlock}. Highest block seen: ${highestBlockSeen}`);
      return allEvents;
    } catch (error) {
      this.logger.error(`Error fetching events for contract ${contractAddress}:`, error);
      return [];
    }
  }

  /**
   * Main indexer run method
   */
  private async runIndexer(): Promise<void> {
    if (this.isIndexerRunning || this.isShutdownRequested) {
      this.logger.info(this.isIndexerRunning ? "Indexer is already running. Skipping this run." : "Shutdown requested, skipping indexer run");
      return;
    }

    try {
      this.isIndexerRunning = true;
      this.logger.info(`========== Indexer Run Started ==========`);

      const tradingPairs = this.getTradingPairs().tradingPairs;
      if (tradingPairs.length === 0) {
        throw new Error("No trading pairs configured. Exiting indexer.");
      }

      this.logger.info(`Indexing ${tradingPairs.length} trading pairs`);
      const contractAddresses = tradingPairs.map(pair => pair.address);
      
      this.logger.info(`Fetching last indexed blocks for ${contractAddresses.length} contracts`);
      const lastIndexedBlocks = await this.getLastIndexedBlocksForContracts(contractAddresses);

      const fetchTasks = tradingPairs.map(pair => ({
        contractAddress: pair.address,
        contractName: pair.name,
        lastIndexedBlock: lastIndexedBlocks.get(pair.address) || 0
      }));

      this.logger.info(`Starting parallel fetch for ${fetchTasks.length} contracts`);
      const fetchResults = await Promise.all(
        fetchTasks.map(async task => {
          try {
            const events = await this.fetchEvents(task.contractAddress, task.lastIndexedBlock);
            let maxBlockForContract = task.lastIndexedBlock;
            
            if (events.length > 0) {
              maxBlockForContract = Math.max(...events.map(e => e.block_number));
            }

            return {
              contractAddress: task.contractAddress,
              contractName: task.contractName,
              lastIndexedBlock: task.lastIndexedBlock,
              maxBlockForContract,
              events
            };
          } catch (error) {
            this.logger.error(`Error in parallel fetch for contract ${task.contractAddress}:`, error);
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

      const allEvents = fetchResults.flatMap(result => result.events);
      const blockUpdates = fetchResults
        .filter(result => result.maxBlockForContract > result.lastIndexedBlock)
        .map(result => ({
          contractAddress: result.contractAddress,
          blockNumber: result.maxBlockForContract
        }));

      if (blockUpdates.length > 0) {
        this.logger.info(`Updating last indexed blocks for ${blockUpdates.length} contracts`);
        await this.updateLastIndexedBlocksForContracts(blockUpdates);
      }

      if (!this.eventProcessor) {
        throw new Error("EventProcessor not initialized. Cannot process events.");
      }

      if (allEvents.length > 0) {
        this.logger.info(`Processing ${allEvents.length} events`);
        await this.eventProcessor.processEvents(allEvents);
        this.logger.info(`Successfully processed ${allEvents.length} events`);
      } else {
        this.logger.info("No new events found in this indexer run.");
      }

      this.logger.info(`========== Indexer Run Completed ==========`);
    } catch (error) {
      this.logger.error("Error running indexer:", error);
      throw error;
    } finally {
      this.isIndexerRunning = false;
    }
  }

  /**
   * Start the indexer service
   */
  public start(): void {
    this.logger.info(`Starting Kuru Indexer using thirdweb insight API. Interval: ${this.POLLING_INTERVAL}ms`);

    this.eventProcessor = new EventProcessor();

    const cronExpression = convertIntervalToCronExpression(this.POLLING_INTERVAL);
    this.logger.info(`Scheduling indexer with cron expression: ${cronExpression}`);

    this.indexerTask = cron.schedule(cronExpression, () => {
      this.logger.debug(`Triggering scheduled indexer run via cron`);
      this.runIndexer();
    }, {
      scheduled: true
    });
  }

  /**
   * Stop the indexer service
   */
  public async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isShutdownRequested = true;

      if (this.indexerTask) {
        this.logger.info('Stopping indexer cron job');
        this.indexerTask.stop();
        this.indexerTask = null;
      }

      if (!this.isIndexerRunning) {
        this.logger.info('No indexer run in progress, proceeding with shutdown');
        if (this.eventProcessor) {
          this.logger.info('Shutting down event processor');
          this.eventProcessor.shutdown();
          this.eventProcessor = null;
        }
        this.logger.info('Shutdown complete');
        resolve();
        return;
      }

      this.logger.info('Waiting for in-progress indexer run to complete...');

      const checkInterval = setInterval(() => {
        if (!this.isIndexerRunning) {
          clearInterval(checkInterval);
          if (this.eventProcessor) {
            this.logger.info('Shutting down event processor');
            this.eventProcessor.shutdown();
            this.eventProcessor = null;
          }
          this.logger.info('Shutdown complete');
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (this.eventProcessor) {
          this.logger.info('Force shutting down event processor after timeout');
          this.eventProcessor.shutdown();
          this.eventProcessor = null;
        }
        this.logger.warn('Forcing indexer shutdown after timeout');
        resolve();
      }, 30000);
    });
  }
} 