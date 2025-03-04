import { createConfig } from "ponder";
import { http } from "viem";

import { OrderBookAbi } from "./abis/OrderBookAbi";

export default createConfig({
  networks: {
    monadTestnet: {
      chainId: 10143,
      transport: http(process.env.PONDER_RPC_URL_10143),
    },
  },
  contracts: {
    OrderBook: {
      abi: OrderBookAbi,
      network: "monadTestnet",
      filter: {
        event: "Trade",
        args: {},
      },
      startBlock: "latest",
      endBlock: undefined,
    },
  },
});
