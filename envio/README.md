# Envio Indexer

This directory contains the Envio indexer configuration for Kuru Orderbook contracts on the Monad testnet.

*Please refer to the [Envio documentation website](https://docs.envio.dev) for a thorough guide on all [Envio](https://envio.dev) indexer features.*

## Configuration Files

*   `config.yaml`: Defines the network, data sources (contracts, events), and entities.
*   `schema.graphql`: Defines the GraphQL schema for the indexed data.
*   `src/EventHandlers.ts`: Contains the TypeScript event handler logic.

## Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env` and add your Envio API token:
    ```bash
    cp .env.example .env
    ```
    *   `ENVIO_API_TOKEN`: Obtain this from [https://envio.dev/app/api-tokens](https://envio.dev/app/api-tokens).

3.  **Generate code:**
    ```bash
    pnpm codegen
    ```

4.  **Build the indexer:**
    ```bash
    pnpm build
    ```

5.  **Run the indexer:**
    *   **Development:**
        ```bash
        pnpm dev
        ```
    *   **Production:**
        ```bash
        pnpm start
        ```
    This will start the indexer, process historical data, and listen for new events. It also serves a GraphQL endpoint.

## Other Commands

*   **Clean build artifacts:** `pnpm clean`
*   **Watch for changes and rebuild:** `pnpm watch`
*   **Run tests:** `pnpm test`
