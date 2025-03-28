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
      address: [
        "0xD3AF145f1Aa1A471b5f0F62c52Cf8fcdc9AB55D3", // MONUSDC
        "0x94B72620e65577De5FB2b8a8B93328CAf6Ca161b", // DAKMON
        "0x277bF4a0AAc16f19d7bf592FeFFc8D2d9a890508", // CHOGMON
        "0xD5C1Dc181c359f0199c83045A85Cd2556B325De0", // YAKIMON
        // Add more contract addresses here
      ],
      filter: {
        event: "Trade",
        args: {},
      },
      startBlock: 6294247,
      endBlock: undefined,
    },
  },
});
