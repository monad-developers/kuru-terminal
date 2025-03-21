import { createConfig } from "ponder";
import { http } from "viem";
import { KuruOrderBookAbi } from "./abis/KuruOrderBookAbi";

import "dotenv/config";

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
      filter: {
        event: "Trade",
        args: {},
      },
      startBlock: 6294247,
      endBlock: undefined,
    },
  },
});
