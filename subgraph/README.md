# Subgraph for Kuru Orderbook

This directory contains the shared subgraph code used for indexing events (Trade) from Kuru Orderbook contracts on the Monad testnet. The same codebase can be deployed to multiple subgraph providers including The Graph, Alchemy, and Goldsky.

## Configuration Files

*   `subgraph.yaml.mustache`: A [Mustache](https://mustache.github.io/) template for the subgraph manifest.
*   `config/trading-pairs.json`: Contains the list of contract addresses and start blocks for different Kuru trading pairs. This data is injected into the Mustache template to generate the final `subgraph.yaml`.
*   `schema.graphql`: Defines the structure of the data (entities) to be stored and queried (e.g., `Trade`).
*   `src/mapping.ts`: Contains the AssemblyScript code (mapping functions) that transforms blockchain events into graph entities defined in the schema.
*   `abis/`: Contains the ABI JSON files for the Kuru contracts.

## Mustache Templating (`subgraph.yaml.mustache`)

Using a Mustache template for `subgraph.yaml` makes it easy to add new Kuru trading pair contracts to the subgraph without manually duplicating data source definitions. The `prepare` script in `package.json` uses the `mustache` CLI to read data from `config/trading-pairs.json` and render the final `subgraph.yaml` manifest file.

To add a new contract:
1.  Add its details (address, start block, network, pair name) to the `kuruContracts` array in `config/trading-pairs.json`.
2.  Run `yarn prepare` to regenerate `subgraph.yaml`.
3.  Re-deploy the subgraph.

## Common Setup (Required for All Providers)

**Prerequisites:**
*   Node.js
*   [Graph CLI](https://thegraph.com/docs/en/cli/): `npm install -g @graphprotocol/graph-cli`

**Steps:**

1.  **Install Dependencies:**
    ```bash
    yarn
    ```

2.  **Generate Manifest:** (Runs automatically on install via `prepare` script)
    This command uses Mustache to generate `subgraph.yaml` from the template and config.
    ```bash
    yarn prepare
    ```

3.  **Generate Code:**
    This generates AssemblyScript types from the GraphQL schema and contract ABIs.
    ```bash
    yarn codegen
    ```

4.  **Build Subgraph:**
    Compiles the subgraph to WebAssembly.
    ```bash
    yarn build
    ```

## Deployment Options

### The Graph Hosted Service

1.  **Authenticate:**
    ```bash
    graph auth --studio <YOUR_DEPLOY_KEY>
    ```

2.  **Deploy:**
    ```bash
    # Make sure the subgraph name in package.json ('deploy' script) is correct
    yarn deploy
    ```

### Alchemy Subgraph

1.  **Get your deploy key** from the Alchemy Dashboard.

2.  **Deploy to Alchemy:**
    ```bash
    graph deploy example-subgraph-name \
      --version-label v0.0.1 \
      --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
      --deploy-key <YOUR_DEPLOY_KEY> \
      --ipfs https://ipfs.satsuma.xyz
    ```

For more details, see [Alchemy Subgraphs Quickstart](https://docs.alchemy.com/reference/subgraphs-quickstart).

### Goldsky Subgraph

1.  **Deploy to Goldsky:**
    ```bash
    goldsky subgraph deploy <SUBGRAPH_NAME> \
      --from-ipfs <IPFS_HASH> \
      --label <DEPLOYMENT_LABEL>
    ```

For more details, see [Goldsky Subgraph Guide](https://docs.goldsky.com/subgraphs/migrate-from-the-graph).
