CREATE TABLE "capsule_prizes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"emoji" text DEFAULT '🎁' NOT NULL,
	"image_url" text,
	"rarity" text DEFAULT 'common' NOT NULL,
	"weight" integer DEFAULT 10 NOT NULL,
	"stock" integer,
	"cost" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capsules" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"box_index" integer NOT NULL,
	"prize_id" integer,
	"prize_name" text NOT NULL,
	"prize_description" text DEFAULT '' NOT NULL,
	"prize_emoji" text NOT NULL,
	"prize_image_url" text,
	"rarity" text NOT NULL,
	"opened_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "capsules" ADD CONSTRAINT "capsules_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "capsules_order_box_idx" ON "capsules" USING btree ("order_id","box_index");