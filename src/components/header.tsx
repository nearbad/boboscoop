import { eq } from "drizzle-orm";
import { SiteHeaderClient } from "@/components/site-header";
import { db, schema } from "@/lib/db";

// Hides the "Отзывы" link until there is at least one published review.
export async function SiteHeader() {
  const rows = await db.select({ id: schema.reviews.id }).from(schema.reviews).where(eq(schema.reviews.visible, true)).limit(1);
  return <SiteHeaderClient showReviews={rows.length > 0} />;
}
