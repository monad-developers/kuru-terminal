ALTER TABLE "initialized" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_created" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders_canceled" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ownership_handover_canceled" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ownership_handover_requested" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ownership_transferred" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "upgraded" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "initialized" CASCADE;--> statement-breakpoint
DROP TABLE "order_created" CASCADE;--> statement-breakpoint
DROP TABLE "orders_canceled" CASCADE;--> statement-breakpoint
DROP TABLE "ownership_handover_canceled" CASCADE;--> statement-breakpoint
DROP TABLE "ownership_handover_requested" CASCADE;--> statement-breakpoint
DROP TABLE "ownership_transferred" CASCADE;--> statement-breakpoint
DROP TABLE "upgraded" CASCADE;--> statement-breakpoint
ALTER TABLE "contract_block_tracker" DROP CONSTRAINT "contract_block_tracker_chain_id_contract_address_pk";--> statement-breakpoint
ALTER TABLE "contract_block_tracker" ADD CONSTRAINT "contract_block_tracker_contract_address_pk" PRIMARY KEY("contract_address");--> statement-breakpoint
ALTER TABLE "contract_block_tracker" DROP COLUMN "chain_id";