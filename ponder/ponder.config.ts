import { createConfig } from "ponder";
import { http } from "viem";
import { KuruOrderBookAbi } from "./abis/KuruOrderBookAbi";

import "dotenv/config";

/**
 * Ponder configuration for KuruOrderBook indexing
 * Currently configured to index Trade events only
 * 
 * Note: To add more events:
 * 1. Add new event filter in the contracts.KuruOrderBookAbi.filter array
 * 2. Create corresponding table in ponder.schema.ts
 * 3. Add event handler in index.ts
 */
export default createConfig({
  // Database config can be overridden via Ponder Cloud UI, where you can either use your own connection URL or spin up a managed DB by Neon
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
    poolConfig: {
      ssl: true,
    },
  },
  networks: {
    monadTestnet: {
      chainId: 10143,
      transport: http(process.env.PONDER_RPC_URL_10143),
    },
  },
  contracts: {
    KuruOrderBookAbi: {
      abi: KuruOrderBookAbi,
      network: "monadTestnet",
      address: [
        "0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3", // MONUSDC
        // Add more contract addresses here
      ],
      // Currently filtering for Trade events only
      // To add more events, include additional filter objects here
      filter: [{
        event: "Trade",
        args: {},
      }],
      startBlock: 20035908,
      endBlock: undefined,
    },
  },
});
