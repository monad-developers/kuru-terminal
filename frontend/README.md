# Frontend

This directory contains the Next.js application for the Kuru Terminal UI.

## Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env` and fill in the required environment variables:
    ```bash
    cp .env.example .env
    ```
    You will need to provide URLs for the various indexing service APIs and a Monad Testnet RPC URL.

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

```bash
pnpm build
```

## Starting the Production Server

```bash
pnpm start
``` 