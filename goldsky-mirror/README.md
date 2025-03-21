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

## Setup

1. Deploy the webhook server (Docker container available)
2. Configure environment variables for database connection
3. Deploy the Goldsky Mirror pipeline pointing to the webhook server

## Usage

Once deployed, the system automatically:
1. Monitors the Monad testnet blockchain for logs from KuruOrderBook contracts
2. Processes these logs through the Goldsky pipeline
3. Stores the decoded data for use in applications
