ALTER TYPE "public"."order_status" ADD VALUE 'APPROVED' BEFORE 'WAITING_ARRIVAL';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'MIRROR_ARRIVED' BEFORE 'WAITING_ARRIVAL';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'PENDING_ISSUE';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'CANCELLED';--> statement-breakpoint
CREATE TABLE "refused_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"supplier_id" integer NOT NULL,
	"return_date" timestamp NOT NULL,
	"reason" text NOT NULL,
	"boleto_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "remaining_value" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cancelled_by" text;--> statement-breakpoint
ALTER TABLE "refused_invoices" ADD CONSTRAINT "refused_invoices_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;