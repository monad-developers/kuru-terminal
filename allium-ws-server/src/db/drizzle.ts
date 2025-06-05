/*
    Lots of boilerplate for DB specification, would be nice if we could share this across implementations
*/

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
    throw new Error('Missing required environment variable: DATABASE_URL');
}

export const db = drizzle(process.env.DATABASE_URL); 