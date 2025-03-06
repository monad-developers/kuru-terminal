CREATE SCHEMA "quicknode";
--> statement-breakpoint
CREATE TABLE "quicknode"."trade" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" numeric(78, 0),
	"tx_origin" text,
	"maker_address" text,
	"taker_address" text,
	"is_buy" boolean,
	"price" numeric(78, 0),
	"updated_size" numeric(78, 0),
	"filled_size" numeric(78, 0),
	"block_height" numeric(78, 0)
);
