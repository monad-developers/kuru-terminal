# Kuru Terminal

A reference implementation showcasing best practices for indexing Kuru orderbook contracts using multiple indexing services on Monad.

## Project Aim

This project demonstrates high-quality indexing practices for smart contract data on Monad. It integrates multiple indexing services (Goldsky, Allium, Envio, Ponder, QuickNode, TheGraph, Alchemy, and thirdweb) to index Kuru orderbook contract events. The accompanying frontend consumes all the integrated services and compares performance metrics across them.

**Deployment:** [https://kuru-terminal.vercel.app/](https://kuru-terminal.vercel.app/)
**Compare Indexing Services:** [https://kuru-terminal.vercel.app/compare](https://kuru-terminal.vercel.app/compare)

## Subdirectories

This repository contains several subdirectories, each representing a different indexing service or component:

*   [`frontend/`](./frontend/README.md): The user interface for viewing trade data.
*   [`thirdweb-insight-api/`](./thirdweb-insight-api/README.md): Indexing service using Thirdweb Insight API.
*   [`qn-streams/`](./qn-streams/README.md): Indexing service using QuickNode Streams.
*   [`ponder/`](./ponder/README.md): Indexing service using Ponder.
*   [`goldsky-mirror/`](./goldsky-mirror/README.md): Indexing service using Goldsky Mirror.
*   [`envio/`](./envio/README.md): Indexing service using Envio.
*   [`allium-ws-server/`](./allium-ws-server/README.md): Indexing service using Allium Websocket Server.
*   [`subgraph/`](./subgraph/README.md): Common subgraph implementation used for The Graph, Alchemy Subgraph, and Goldsky Subgraph deployments.

Please refer to the `README.md` within each subdirectory for specific setup and usage instructions.