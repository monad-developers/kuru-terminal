DROP INDEX "initialized_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "order_created_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "orders_canceled_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "ownership_handover_canceled_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "ownership_handover_requested_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "ownership_transferred_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "trades_tx_order_book_idx";--> statement-breakpoint
DROP INDEX "upgraded_tx_order_book_idx";--> statement-breakpoint
ALTER TABLE "initialized" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "order_created" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "orders_canceled" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "ownership_handover_canceled" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "ownership_handover_requested" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "ownership_transferred" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "log_index" bigint;--> statement-breakpoint
ALTER TABLE "upgraded" ADD COLUMN "log_index" bigint;--> statement-breakpoint
CREATE UNIQUE INDEX "initialized_tx_log_idx" ON "initialized" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "order_created_tx_log_idx" ON "order_created" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_canceled_tx_log_idx" ON "orders_canceled" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_handover_canceled_tx_log_idx" ON "ownership_handover_canceled" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_handover_requested_tx_log_idx" ON "ownership_handover_requested" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_transferred_tx_log_idx" ON "ownership_transferred" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "trades_tx_log_idx" ON "trades" USING btree ("transaction_hash","log_index");--> statement-breakpoint
CREATE UNIQUE INDEX "upgraded_tx_log_idx" ON "upgraded" USING btree ("transaction_hash","log_index");