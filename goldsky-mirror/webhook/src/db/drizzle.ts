import dotenv from "dotenv";
dotenv.config();

import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  ws,
});
