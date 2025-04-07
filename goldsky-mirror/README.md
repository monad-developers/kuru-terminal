# Goldsky Mirror for KuruOrderBook

This repository contains the components needed to index KuruOrderBook contract logs using Goldsky Mirror Pipeline.

## Directory Structure

```
goldsky-mirror/
├── pipeline/        # Goldsky Mirror Pipeline configuration
│   └── kuru-logs-pipeline.yaml
└── webhook/         # Express server for handling Pipeline webhook events
    ├── src/         # Source code
    ├── Dockerfile   # Container configuration
    └── package.json # Dependencies
```

## Components

### Pipeline Configuration

The pipeline configuration (`kuru-logs-pipeline.yaml`) defines a Goldsky Mirror pipeline that:
- Sources data from Monad testnet logs
- Filters for specific contract addresses
- Forwards events to the webhook server

### Webhook Server

The Express server receives log data from the Goldsky pipeline:
- Processes and decodes contract logs
- Stores the decoded data in a database

**Running the Webhook Server:**

1.  **Navigate to the webhook directory:**
    ```bash
    cd webhook
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` and configure database connection details.
    ```bash
    cp .env.example .env
    ```
4.  **Run locally (development):**
    ```bash
    pnpm dev
    ```
5.  **Run in production:**
    First, build the server:
    ```bash
    pnpm build
    ```
    Then, start the server:
    ```bash
    pnpm start
    ```

A Dockerfile is also provided for containerized deployment.

## Setup

1.  Set up and run the [Webhook Server](#webhook-server) (locally or deployed, Docker container available). Ensure necessary environment variables (e.g., database connection) are configured.
2.  Deploy the Goldsky Mirror pipeline defined in `pipeline/kuru-logs-pipeline.yaml`, pointing its webhook sink to the running webhook server endpoint.

## Usage

Once deployed, the system automatically:
1. Monitors the Monad testnet blockchain for logs from KuruOrderBook contracts
2. Processes these logs through the Goldsky pipeline
3. Stores the decoded data for use in applications
