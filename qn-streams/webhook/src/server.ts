import express from "express";
import bodyParser from "body-parser";
import { db } from "./db/drizzle";
import { trade } from "./db/quicknode-schema";
import { EventRequestBody } from "./types";
import { decodeTradeEventsFromLogs } from "./utils";

import "dotenv/config";

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", async (req, res) => {
  res.status(200).send("Kuru Indexer Quicknode Streams Hook");
});

app.post("/", async (req, res) => {
  const { data } = req.body as EventRequestBody;

  try {
    const tradeEvents = decodeTradeEventsFromLogs(data);
    
    if (tradeEvents.length > 0) {
      console.log(
        `[${new Date().toISOString()}] Inserting ${
          tradeEvents.length
        } trades into DB`
      );
      await db.insert(trade).values(tradeEvents);
    }
    res.status(200).send(JSON.stringify(tradeEvents));
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] Error processing request:`,
      error
    );
    res.status(200).send("Internal Server Error");
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(
    `Server is running on port ${PORT} and bound to all interfaces (0.0.0.0)`
  );
});
