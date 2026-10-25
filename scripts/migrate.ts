// Applies SQL migrations from ./drizzle and seeds empty tables with starter content.
// Runs on every `npm run build`; skipped when DATABASE_URL is not set.
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { seedDeliveryMethods, seedDeliveryZones, seedFaq, seedProducts, seedReviews } from "./seed-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[migrate] DATABASE_URL is not set, skipping migrations");
    return;
  }
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle({ client, schema });

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] migrations applied");

  const seeds = [
    [schema.products, seedProducts],
    [schema.deliveryMethods, seedDeliveryMethods],
    [schema.deliveryZones, seedDeliveryZones],
    [schema.faq, seedFaq],
    [schema.reviews, seedReviews],
  ] as const;
  for (const [table, rows] of seeds) {
    const existing = await db.select().from(table).limit(1);
    if (existing.length === 0 && rows.length > 0) {
      await db.insert(table).values(rows as never);
      console.log(`[migrate] seeded ${rows.length} rows`);
    }
  }
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
