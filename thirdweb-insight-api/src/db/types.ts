import { trade } from "./schema";

export type TradeEvent = Omit<typeof trade.$inferSelect, "id">;
