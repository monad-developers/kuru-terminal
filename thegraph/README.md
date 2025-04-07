# The Graph Subgraph for Kuru Orderbook

This directory contains a subgraph for indexing events from the Kuru Orderbook contracts on the Monad testnet using The Graph Protocol.

## Configuration Files

*   `subgraph.yaml.mustache`: A [Mustache](https://mustache.github.io/) template for the subgraph manifest.
*   `config/trading-pairs.json`: Contains the list of contract addresses and start blocks for different Kuru trading pairs. This data is injected into the Mustache template to generate the final `subgraph.yaml`.
*   `schema.graphql`: Defines the structure of the data (entities) to be stored and queried (e.g., `Trade`, `OrderCreated`, `Pair`).
*   `src/mapping.ts`: Contains the AssemblyScript code (mapping functions) that transforms blockchain events into graph entities defined in the schema.
*   `abis/`: Contains the ABI JSON files for the Kuru contracts.

## Mustache Templating (`subgraph.yaml.mustache`)

Using a Mustache template for `subgraph.yaml` makes it easy to add new Kuru trading pair contracts to the subgraph without manually duplicating data source definitions. The `prepare` script in `package.json` uses the `mustache` CLI to read data from `config/trading-pairs.json` and render the final `subgraph.yaml` manifest file.

To add a new contract:
1.  Add its details (address, start block, network, pair name) to the `kuruContracts` array in `config/trading-pairs.json`.
2.  Run `pnpm prepare` (or `npm run prepare`) to regenerate `subgraph.yaml`.
3.  Re-deploy the subgraph.

## Setup and Deployment

**Prerequisites:**
*   Node.js and pnpm (or npm/yarn)
*   [Graph CLI](https://thegraph.com/docs/en/cli/): `npm install -g @graphprotocol/graph-cli` or `pnpm add -g @graphprotocol/graph-cli`

**Steps:**

1.  **Install Dependencies:**
    ```bash
    pnpm install
    # or npm install / yarn install
    ```

2.  **Generate Manifest:** (Runs automatically on install via `prepare` script)
    This command uses Mustache to generate `subgraph.yaml` from the template and config.
    ```bash
    pnpm prepare
    ```

3.  **Generate Code:**
    This generates AssemblyScript types from the GraphQL schema and contract ABIs.
    ```bash
    pnpm codegen
    ```

4.  **Build Subgraph:**
    Compiles the subgraph to WebAssembly.
    ```bash
    pnpm build
    ```

5.  **Deploy to The Graph Studio (Hosted Service):**
    *   Authenticate (if not done already): `graph auth --studio <YOUR_DEPLOY_KEY>`
    *   Deploy (replace `<your-studio-slug>` with your actual slug if different from `kuru-subgraph` defined in `package.json`):
        ```bash
        # Make sure the subgraph name in package.json ('deploy' script) is correct
        pnpm deploy
        ```

6.  **Deploy Locally (Requires a local Graph Node running):**
    *   Create the subgraph on the local node:
        ```bash
        pnpm create-local
        ```
    *   Deploy to the local node:
        ```bash
        pnpm deploy-local
        ```
    *   (To remove): `pnpm remove-local`

Refer to [The Graph Documentation](https://thegraph.com/docs/en/) for detailed instructions on setting up a local graph node and deploying subgraphs. 