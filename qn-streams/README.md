# Kuru Quicknode Streams Webhook

This repository contains the components needed to process and index KuruOrderBook contract events using Quicknode Streams.

## Directory Structure

```
qn-streams/
├── webhook/         # Express server for handling Quicknode Streams events
    ├── src/         # Source code
    ├── Dockerfile   # Container configuration
    └── package.json # Dependencies
```

## Components

### Webhook Server

The Express server processes events from Quicknode Streams:
- Receives and validates webhook events
- Processes Trade events from the KuruOrderBook contract
- Stores the event data in a PostgreSQL database using Drizzle ORM

## Setup

1. Deploy the webhook server (Docker container available)
2. Configure environment variables for database connection
3. Deploy the Quicknode Stream pointing to the webhook server

## Architecture

The service is built with:
- Express.js for the web server
- Drizzle ORM for type-safe database operations
- Ethers.js for blockchain data decoding and interaction
- PostgreSQL for persistent storage

Once deployed, the system automatically:
1. Receives webhook events from Quicknode Streams
2. Processes Trade events from the KuruOrderBook contract
3. Stores the processed data in PostgreSQL for use in applications
