CREATE TABLE "delivery_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"extra" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" serial NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"telegram" text DEFAULT '' NOT NULL,
	"delivery_method" text NOT NULL,
	"delivery_zone" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"boxes" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"delivery_price" integer NOT NULL,
	"total" integer NOT NULL,
	"payment_id" text,
	"paid_at" timestamp with time zone,
	"admin_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"emoji" text DEFAULT '🎀' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text,
	"available" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"image_url" text,
	"visible" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
