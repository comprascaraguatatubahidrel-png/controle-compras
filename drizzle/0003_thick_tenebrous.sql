ALTER TYPE "public"."order_status" ADD VALUE 'CREATED' BEFORE 'SENT';--> statement-breakpoint
CREATE TABLE "partial_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"received_value" numeric(10, 2) NOT NULL,
	"remaining_value_after" numeric(10, 2) NOT NULL,
	"received_date" timestamp DEFAULT now() NOT NULL,
	"received_by" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'CREATED';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "requested_by" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "partial_reason" text;--> statement-breakpoint
ALTER TABLE "partial_receipts" ADD CONSTRAINT "partial_receipts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;