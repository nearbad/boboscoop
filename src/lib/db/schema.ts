import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { OrderBox } from "@/lib/pricing";

// Single-row table holding the shop settings as JSON (see src/lib/settings.ts).
export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🎀"),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  available: boolean("available").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const deliveryMethods = pgTable("delivery_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull().default(0),
  note: text("note").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

// Optional regional surcharge added on top of the delivery method price.
export const deliveryZones = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  extra: integer("extra").notNull().default(0),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  imageUrl: text("image_url"),
  visible: boolean("visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const faq = pgTable("faq", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  visible: boolean("visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "assembling",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: serial("number").notNull(),
  status: text("status").$type<OrderStatus>().notNull().default("pending_payment"),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  telegram: text("telegram").notNull().default(""),
  deliveryMethod: text("delivery_method").notNull(),
  deliveryZone: text("delivery_zone").notNull().default(""),
  address: text("address").notNull(),
  comment: text("comment").notNull().default(""),
  boxes: jsonb("boxes").$type<OrderBox[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryPrice: integer("delivery_price").notNull(),
  total: integer("total").notNull(),
  paymentId: text("payment_id"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  adminNote: text("admin_note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type DeliveryMethod = typeof deliveryMethods.$inferSelect;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type FaqItem = typeof faq.$inferSelect;
export type Order = typeof orders.$inferSelect;
