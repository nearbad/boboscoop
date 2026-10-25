CREATE TABLE "packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"items_count" integer,
	"badge" text DEFAULT '' NOT NULL,
	"stock" integer,
	"max_per_order" integer DEFAULT 5 NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "packs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "author" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "text" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "packs" jsonb DEFAULT '[]'::jsonb NOT NULL;