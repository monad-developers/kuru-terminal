# Allium WebSocket Server

This directory contains a WebSocket server that processes Kuru Orderbook events (Trade) sourced from an Allium Datastream (via Confluent Cloud Kafka) and broadcasts them to connected clients via a WebSocket server.

## Features

*   Connects to a Confluent Cloud Kafka cluster to consume Allium Datastreams.
*   Decodes Kuru Orderbook contract event (`Trade`).
*   Broadcasts processed events to connected WebSocket clients.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env` and fill in your Confluent Cloud Kafka credentials and desired server port:
    ```bash
    cp .env.example .env
    ```
    *   `BOOTSTRAP_SERVERS`: Your Confluent Cloud bootstrap server address.
    *   `CLUSTER_API_KEY`: Your Confluent Cloud API key.
    *   `CLUSTER_API_SECRET`: Your Confluent Cloud API secret.
    *   `PORT`: The port the WebSocket server should listen on (default: 8080).

3.  **Build the server:**
    ```bash
    npm run build
    ```

4.  **Run the server:**
    *   **Development:**
        ```bash
        npm run dev
        ```
    *   **Production (after building):**
        ```bash
        npm start
        ```

## Connecting

WebSocket clients can connect to `ws://localhost:{PORT}` (or the deployed server address) to receive Trade events. 