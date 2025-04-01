CREATE TABLE "contract_block_tracker" (
	"chain_id" varchar NOT NULL,
	"contract_address" varchar NOT NULL,
	"last_indexed_block" bigint DEFAULT 0,
	"last_updated" timestamp DEFAULT now(),
	"contract_name" varchar,
	CONSTRAINT "contract_block_tracker_chain_id_contract_address_pk" PRIMARY KEY("chain_id","contract_address")
);
--> statement-breakpoint
CREATE TABLE "initialized" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"version" varchar
);
--> statement-breakpoint
CREATE TABLE "order_created" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"order_id" varchar,
	"owner" varchar,
	"size" varchar,
	"price" varchar,
	"is_buy" boolean
);
--> statement-breakpoint
CREATE TABLE "orders_canceled" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"order_ids" varchar,
	"owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_handover_canceled" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"pending_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_handover_requested" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"pending_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_transferred" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"old_owner" varchar,
	"new_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"order_id" varchar,
	"maker_address" varchar,
	"is_buy" boolean,
	"price" varchar,
	"updated_size" varchar,
	"taker_address" varchar,
	"tx_origin" varchar,
	"filled_size" varchar
);
--> statement-breakpoint
CREATE TABLE "upgraded" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"implementation" varchar
);
--> statement-breakpoint
CREATE UNIQUE INDEX "initialized_tx_order_book_idx" ON "initialized" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "order_created_tx_order_book_idx" ON "order_created" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_canceled_tx_order_book_idx" ON "orders_canceled" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_handover_canceled_tx_order_book_idx" ON "ownership_handover_canceled" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_handover_requested_tx_order_book_idx" ON "ownership_handover_requested" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "ownership_transferred_tx_order_book_idx" ON "ownership_transferred" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "trades_tx_order_book_idx" ON "trades" USING btree ("transaction_hash","order_book_address");--> statement-breakpoint
CREATE UNIQUE INDEX "upgraded_tx_order_book_idx" ON "upgraded" USING btree ("transaction_hash","order_book_address");