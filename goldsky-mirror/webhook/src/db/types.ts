import { orderCreated, initialized, ordersCanceled, ownershipHandoverCanceled, ownershipHandoverRequested, ownershipTransferred, trade, upgraded } from "./goldsky-schema";

export type TradeEvent = typeof trade.$inferSelect;
export type OrderCreatedEvent = typeof orderCreated.$inferSelect;
export type OrdersCanceledEvent = typeof ordersCanceled.$inferSelect;
export type OwnershipHandoverCanceledEvent = typeof ownershipHandoverCanceled.$inferSelect;
export type OwnershipHandoverRequestedEvent = typeof ownershipHandoverRequested.$inferSelect;
export type OwnershipTransferredEvent = typeof ownershipTransferred.$inferSelect;
export type UpgradedEvent = typeof upgraded.$inferSelect;
export type InitializedEvent = typeof initialized.$inferSelect; 