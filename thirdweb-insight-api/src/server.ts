import dotenv from 'dotenv';
import { IndexerService } from './services/indexer.service';
import { createLogger } from './utils/logger.util';

// Load environment variables
dotenv.config();

// Create logger for this module
const logger = createLogger('Server');

// Initialize and start the indexer service
const indexerService = new IndexerService();
indexerService.start();

// Handle process termination
async function handleShutdown(signal: string) {
  logger.info(`${signal} signal received. Shutting down gracefully...`);
  await indexerService.stop();
  process.exit(0);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
