CREATE TABLE "initialized" (
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"version" varchar
);
--> statement-breakpoint
CREATE TABLE "order_created" (
	"id" varchar PRIMARY KEY NOT NULL,
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
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"order_ids" varchar,
	"owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_handover_canceled" (
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"pending_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_handover_requested" (
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"pending_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "ownership_transferred" (
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"old_owner" varchar,
	"new_owner" varchar
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" varchar PRIMARY KEY NOT NULL,
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
	"id" varchar PRIMARY KEY NOT NULL,
	"block_number" bigint,
	"transaction_hash" varchar,
	"order_book_address" varchar,
	"implementation" varchar
);
