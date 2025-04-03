import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { count, eq } from "drizzle-orm";
import {
  trade,
  orderCreated,
  ordersCanceled,
  initialized,
  ownershipHandoverCanceled,
  ownershipHandoverRequested,
  ownershipTransferred,
  upgraded,
  contractBlockTracker,
} from "./db/schema";
import { startIndexer } from "./services/indexer.service";
import { getEvents } from "./services/event-repository.service";
import { EventQueryParams, KuruEvents } from "./types";
import { isValidEventType, isValidSortOrder } from "./utils/indexer.util";
import { createLogger } from "./utils/logger.util";
import { MONAD_TESTNET_CHAIN_ID } from "./constants";
import cors from "cors";

// Create logger for this module
const logger = createLogger('API');

// Create Express application
const app = express();

// Start the indexer when the app starts
const POLLING_INTERVAL = process.env.POLLING_INTERVAL ? parseInt(process.env.POLLING_INTERVAL) : 5000;
startIndexer(POLLING_INTERVAL);

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// Create router
const router = express.Router();

// Home route
router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Kuru Indexer thirdweb Insight API");
});

// Get indexer status
router.get("/status", async (req: Request, res: Response) => {
  try {
    logger.debug('Request received for indexer status');
    
    const [contractBlockTrackers, tradeCounts, orderCreatedCounts, ordersCanceledCounts, initializedCounts, ownershipHandoverCanceledCounts, ownershipHandoverRequestedCounts, ownershipTransferredCounts, upgradedCounts] = await db.transaction(
      async (tx) => {
        // Get all contract block trackers for the current chain
        const contractBlockTrackers = await tx
          .select()
          .from(contractBlockTracker)
          .where(eq(contractBlockTracker.chain_id, MONAD_TESTNET_CHAIN_ID.toString()));

        // Get counts of each event type using Drizzle's count function
        const tradeCounts = await db.select({ value: count() }).from(trade);
        const orderCreatedCounts = await db.select({ value: count() }).from(orderCreated);
        const ordersCanceledCounts = await db.select({ value: count() }).from(ordersCanceled);
        const initializedCounts = await db.select({ value: count() }).from(initialized);
        const ownershipHandoverCanceledCounts = await db.select({ value: count() }).from(ownershipHandoverCanceled);
        const ownershipHandoverRequestedCounts = await db.select({ value: count() }).from(ownershipHandoverRequested);
        const ownershipTransferredCounts = await db.select({ value: count() }).from(ownershipTransferred);
        const upgradedCounts = await db.select({ value: count() }).from(upgraded);

        return [contractBlockTrackers, tradeCounts, orderCreatedCounts, ordersCanceledCounts, initializedCounts, ownershipHandoverCanceledCounts, ownershipHandoverRequestedCounts, ownershipTransferredCounts, upgradedCounts];
      }
    )

    // Format contract block trackers for the response
    const contractsStatus = contractBlockTrackers.map(tracker => ({
      contract_address: tracker.contract_address,
      contract_name: tracker.contract_name || 'Unknown Contract',
      last_indexed_block: tracker.last_indexed_block,
      last_updated: tracker.last_updated
    }));

    const status = {
      contracts: contractsStatus,
      event_counts: {
        trade: tradeCounts[0]?.value || 0,
        orderCreated: orderCreatedCounts[0]?.value || 0,
        ordersCanceled: ordersCanceledCounts[0]?.value || 0,
        initialized: initializedCounts[0]?.value || 0,
        ownershipHandoverCanceled: ownershipHandoverCanceledCounts[0]?.value || 0,
        ownershipHandoverRequested: ownershipHandoverRequestedCounts[0]?.value || 0,
        ownershipTransferred: ownershipTransferredCounts[0]?.value || 0,
        upgraded: upgradedCounts[0]?.value || 0,
      },
    };
    
    logger.debug(`Status response prepared with ${Object.keys(status.event_counts).length} event types and ${contractsStatus.length} contracts`);
    res.status(200).json(status);
  } catch (error) {
    logger.error("Error getting indexer status:", error);
    res.status(500).json({ error: "Error getting indexer status" });
  }
});

// Events API endpoint
router.get("/events", async (req: Request, res: Response) => {
  try {
    const {
      event_type,
      sort_by = "block_number",
      sort_order = "desc",
      limit = "20",
    } = req.query;
    
    logger.debug(`Events request received with params: ${JSON.stringify({ event_type, sort_by, sort_order, limit })}`);
    
    // Validate event type
    if (!event_type || typeof event_type !== "string" || !isValidEventType(event_type)) {
      logger.warn(`Invalid event_type parameter: ${event_type}`);
      return res.status(400).json({
        error: "Invalid event_type parameter. Must be one of: trade, orderCreated, ordersCanceled, initialized, ownershipHandoverCanceled, ownershipHandoverRequested, ownershipTransferred, upgraded",
      });
    }
    
    // Validate sort order
    if (sort_order && typeof sort_order === "string" && !isValidSortOrder(sort_order)) {
      logger.warn(`Invalid sort_order parameter: ${sort_order}`);
      return res.status(400).json({
        error: "Invalid sort_order parameter. Must be 'asc' or 'desc'",
      });
    }
    
    // Parse limit
    const parsedLimit = limit ? parseInt(limit as string) : 20;
    
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      logger.warn(`Invalid limit parameter: ${limit}`);
      return res.status(400).json({
        error: "Invalid limit parameter. Must be a number between 1 and 100",
      });
    }
    
    // Convert parameters to expected types
    const params: EventQueryParams = {
      eventType: event_type as KuruEvents,
      sortBy: sort_by as string,
      sortOrder: sort_order as "asc" | "desc",
      limit: parsedLimit,
    };
    
    // Get events
    logger.debug(`Fetching events with params: ${JSON.stringify(params)}`);
    const result = await getEvents(params);
    
    logger.debug(`Successfully retrieved ${result.data.length} events`);
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error getting events:", error);
    res.status(500).json({ error: "Error getting events" });
  }
});

// Register router with app
app.use(router);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${new Date().toISOString()} Error in app:`, err.stack);
  res.status(500).json({ error: "Something went wrong! Please try again later." });
});

export default app;
