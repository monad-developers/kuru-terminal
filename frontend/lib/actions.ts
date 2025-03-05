"use server";

import { db } from "@/db/drizzle";
import { trade } from "@/db/ponder-schema";
import type { Trade } from "@/db/types";
import { desc } from "drizzle-orm";

export async function getTradesFromPostgres(
  limit: number,
): Promise<Trade[]> {
  try {
    const rows = await db
      .select()
      .from(trade)
      .orderBy(desc(trade.blockHeight))
      .limit(limit);

    return rows;
  } catch (error) {
    console.error("Error fetching trades from Postgres:", error);
    return [];
  }
}
