import { eq } from "drizzle-orm";
import { SiteHeaderClient } from "@/components/site-header";
import { capsuleMinSpoons } from "@/lib/capsules";
import { db, schema } from "@/lib/db";
import { getSettings } from "@/lib/settings";

// Hides the "Отзывы" link until there is a published review, and "Капсула" while capsules are off.
export async function SiteHeader() {
  const [reviews, settings] = await Promise.all([
    db.select({ id: schema.reviews.id }).from(schema.reviews).where(eq(schema.reviews.visible, true)).limit(1),
    getSettings(),
  ]);
  return <SiteHeaderClient showReviews={reviews.length > 0} showCapsule={(await capsuleMinSpoons(settings)) !== null} />;
}
