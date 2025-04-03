CREATE TABLE "trade" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trade_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"transaction_hash" text,
	"block_height" numeric(78, 0),
	"order_book_address" text,
	"order_id" numeric(78, 0),
	"tx_origin" text,
	"maker_address" text,
	"taker_address" text,
	"is_buy" boolean,
	"price" numeric(78, 0),
	"updated_size" numeric(78, 0),
	"filled_size" numeric(78, 0)
);
