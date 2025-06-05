A concern I have is that the various indexer implementations are not exactly equivalent in terms of sophistication

For example, the `subgraph`, `ponder`, and `envio` implementations simply write events to their respective data stores, which is then polled by the frontend - totally fine and practical for our purposes

However, the `qn-streams`, `thirdweb-insights-api`, `goldsky-mirror` and `allium-ws-server` implementations take things a step further by exposing websocket servers which can broadcast messages to clients, which means the frontend doesn't need to poll the data store. This is of course a really great approach and should be our recommendation for building high performance apps, but I don't sense it's valid to compare these to the simpler implementations mentioned above

For the `subgraph` implementation, I don't think it's necessary (or possible) to implement the websocket server alongside the indexing, so that's fine. But for `ponder` and `envio` I *think* it's possible to integrate the WS server alongside

My point is basically that if we're willing to go through the effort of making the WS server for some of these implementations, we should probably do it for all of them - where possible - since we will want apps to do the same

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