import "server-only";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export async function getProducts() {
  return db.select().from(schema.products).orderBy(asc(schema.products.sort), asc(schema.products.id));
}

export async function getDelivery() {
  const [methods, zones] = await Promise.all([
    db.select().from(schema.deliveryMethods).where(eq(schema.deliveryMethods.active, true)).orderBy(asc(schema.deliveryMethods.sort)),
    db.select().from(schema.deliveryZones).where(eq(schema.deliveryZones.active, true)).orderBy(asc(schema.deliveryZones.sort)),
  ]);
  return { methods, zones };
}

export async function getLandingData() {
  const [settings, products, reviews, faq, delivery] = await Promise.all([
    getSettings(),
    getProducts(),
    db.select().from(schema.reviews).where(eq(schema.reviews.visible, true)).orderBy(asc(schema.reviews.sort)),
    db.select().from(schema.faq).where(eq(schema.faq.visible, true)).orderBy(asc(schema.faq.sort)),
    getDelivery(),
  ]);
  return { settings, products, reviews, faq, delivery };
}
