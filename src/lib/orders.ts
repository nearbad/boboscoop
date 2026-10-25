import "server-only";
import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import type { Order, OrderStatus } from "@/lib/db/schema";
import { boxPrice, formatRub, spoonsLabel, type OrderBox, type OrderPack } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { escapeHtml, sendTelegram } from "@/lib/telegram";
import { createPayment, getPayment, isDemoPayments } from "@/lib/yookassa";

export { STATUS_LABELS } from "@/lib/order-status";

const str = (max: number) => z.string().trim().max(max);

export const checkoutSchema = z.object({
  boxes: z
    .array(
      z.object({
        spoons: z.number().int(),
        video: z.boolean(),
        wishes: z.object({
          characters: z.array(str(60)).max(30),
          colors: z.array(str(60)).max(30),
          exclude: z.array(str(80)).max(60),
          comment: str(1000),
        }),
      }),
    )
    .max(50),
  packs: z.array(z.object({ packId: z.number().int(), qty: z.number().int().min(1).max(100) })).max(50).default([]),
  name: str(120).min(2, "Укажите имя"),
  phone: str(40).regex(/^[+\d][\d\s()-]{9,}$/, "Проверьте номер телефона"),
  telegram: str(60),
  deliveryMethodId: z.number().int(),
  deliveryZoneId: z.number().int().nullable(),
  address: str(500).min(5, "Укажите адрес пункта выдачи"),
  comment: str(1000),
  consent: z.literal(true, { message: "Нужно согласие с офертой и политикой" }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export class CheckoutError extends Error {}

export async function createOrder(input: CheckoutInput): Promise<Order> {
  const settings = await getSettings();
  if (!settings.acceptingOrders) throw new CheckoutError(settings.closedMessage);
  if (input.boxes.length + input.packs.length === 0) throw new CheckoutError("Корзина пуста");
  if (input.boxes.length > settings.maxBoxes) {
    throw new CheckoutError(`В одном заказе можно не больше ${settings.maxBoxes} боксов на ложки`);
  }
  if (input.boxes.some((b) => b.wishes.exclude.length > settings.maxExclude)) {
    throw new CheckoutError(`В пожеланиях можно исключить не больше ${settings.maxExclude} предметов`);
  }

  const products = await db.select({ name: schema.products.name }).from(schema.products);
  const known = {
    characters: new Set(settings.characters),
    colors: new Set(settings.colors),
    exclude: new Set(products.map((p) => p.name)),
  };

  const boxes: OrderBox[] = input.boxes.map((b) => {
    const price = boxPrice(settings, b);
    if (price === null) throw new CheckoutError("Такого количества ложек нет, обновите корзину");
    return {
      spoons: b.spoons,
      video: b.video,
      price,
      wishes: {
        characters: b.wishes.characters.filter((c) => known.characters.has(c)),
        colors: b.wishes.colors.filter((c) => known.colors.has(c)),
        exclude: b.wishes.exclude.filter((c) => known.exclude.has(c)),
        comment: b.wishes.comment,
      },
    };
  });

  const packs = await resolvePacks(input.packs);

  const method = await db.query.deliveryMethods.findFirst({
    where: and(eq(schema.deliveryMethods.id, input.deliveryMethodId), eq(schema.deliveryMethods.active, true)),
  });
  if (!method) throw new CheckoutError("Выберите способ доставки");

  const zones = await db
    .select()
    .from(schema.deliveryZones)
    .where(eq(schema.deliveryZones.active, true))
    .orderBy(asc(schema.deliveryZones.sort));
  const zone = zones.find((z) => z.id === input.deliveryZoneId);
  if (zones.length > 0 && !zone) throw new CheckoutError("Выберите регион доставки");

  const subtotal = boxes.reduce((s, b) => s + b.price, 0) + packs.reduce((s, p) => s + p.price * p.qty, 0);
  const deliveryPrice = method.price + (zone?.extra ?? 0);

  const [order] = await db
    .insert(schema.orders)
    .values({
      customerName: input.name,
      phone: input.phone,
      telegram: input.telegram.replace(/^@?/, input.telegram ? "@" : ""),
      deliveryMethod: method.name,
      deliveryZone: zone?.name ?? "",
      address: input.address,
      comment: input.comment,
      boxes,
      packs,
      subtotal,
      deliveryPrice,
      total: subtotal + deliveryPrice,
    })
    .returning();
  return order;
}

// Checks ready-made boxes against the catalog: availability, stock and per-order limits.
async function resolvePacks(lines: CheckoutInput["packs"]): Promise<OrderPack[]> {
  if (lines.length === 0) return [];
  const ids = [...new Set(lines.map((l) => l.packId))];
  const rows = await db.select().from(schema.packs).where(inArray(schema.packs.id, ids));
  return ids.map((id) => {
    const qty = lines.filter((l) => l.packId === id).reduce((s, l) => s + l.qty, 0);
    const pack = rows.find((r) => r.id === id);
    if (!pack || !pack.available) throw new CheckoutError("Один из готовых боксов больше недоступен, обновите корзину");
    if (pack.stock !== null && qty > pack.stock) {
      throw new CheckoutError(
        pack.stock === 0 ? `«${pack.title}» закончился` : `«${pack.title}»: осталось только ${pack.stock} шт.`,
      );
    }
    if (qty > pack.maxPerOrder) throw new CheckoutError(`«${pack.title}»: не больше ${pack.maxPerOrder} шт. в заказе`);
    return { packId: pack.id, title: pack.title, price: pack.price, qty };
  });
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// Returns the URL to send the customer to for payment.
export async function startPayment(order: Order): Promise<string> {
  const orderUrl = `${siteUrl()}/order/${order.id}`;
  if (isDemoPayments()) return `${orderUrl}?demo=1`;

  const items = order.boxes.map((b, i) => ({
    description: `Сюрприз-бокс №${i + 1}, ${spoonsLabel(b.spoons)}${b.video ? " + видео" : ""}`,
    amount: b.price,
    subject: "commodity" as const,
  }));
  for (const p of order.packs) {
    items.push({ description: `${p.title} × ${p.qty}`, amount: p.price * p.qty, subject: "commodity" });
  }
  if (order.deliveryPrice > 0) {
    items.push({ description: `Доставка ${order.deliveryMethod}`, amount: order.deliveryPrice, subject: "commodity" });
  }

  const payment = await createPayment({
    // A new key per attempt, so a customer can retry after a cancelled payment.
    idempotenceKey: `${order.id}-${Date.now()}`,
    orderId: order.id,
    amount: order.total,
    description: `Заказ №${order.number} в BoboScoop`,
    returnUrl: orderUrl,
    receipt: { phone: order.phone.replace(/[^\d]/g, ""), items },
  });
  await db.update(schema.orders).set({ paymentId: payment.id }).where(eq(schema.orders.id, order.id));
  const url = payment.confirmation?.confirmation_url;
  if (!url) throw new Error("YooKassa did not return a confirmation URL");
  return url;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (!z.uuid().safeParse(id).success) return undefined;
  return db.query.orders.findFirst({ where: eq(schema.orders.id, id) });
}

// Moves a pending order to "paid" exactly once and notifies the shop owner.
export async function markPaid(orderId: string, paymentId: string | null): Promise<void> {
  const [order] = await db
    .update(schema.orders)
    .set({ status: "paid", paidAt: new Date(), ...(paymentId ? { paymentId } : {}) })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending_payment")))
    .returning();
  if (!order) return;
  // Stock is reserved only once the order is paid.
  for (const p of order.packs) {
    await db
      .update(schema.packs)
      .set({ stock: sql`greatest(${schema.packs.stock} - ${p.qty}, 0)` })
      .where(and(eq(schema.packs.id, p.packId), isNotNull(schema.packs.stock)));
  }
  await notifyPaid(order);
}

// Checks the payment status with YooKassa (used on the return page and by the webhook).
export async function syncPayment(order: Order): Promise<Order> {
  if (order.status !== "pending_payment" || !order.paymentId || isDemoPayments()) return order;
  try {
    const payment = await getPayment(order.paymentId);
    if (payment.status === "succeeded" && payment.metadata?.orderId === order.id) {
      await markPaid(order.id, payment.id);
      return (await getOrder(order.id)) ?? order;
    }
  } catch (err) {
    console.error("[syncPayment]", err);
  }
  return order;
}

async function notifyPaid(order: Order) {
  const e = escapeHtml;
  const lines = [
    `🎀 <b>Новый оплаченный заказ №${order.number}</b>`,
    "",
    ...order.boxes.flatMap((b, i) => {
      const w = b.wishes;
      return [
        `<b>Бокс ${i + 1}:</b> ${spoonsLabel(b.spoons)}${b.video ? " + видео 🎥" : ""} — ${formatRub(b.price)}`,
        w.characters.length ? `  💗 Персонажи: ${e(w.characters.join(", "))}` : "",
        w.colors.length ? `  🎨 Цвета: ${e(w.colors.join(", "))}` : "",
        w.exclude.length ? `  🚫 Не класть: ${e(w.exclude.join(", "))}` : "",
        w.comment ? `  📝 ${e(w.comment)}` : "",
      ].filter(Boolean);
    }),
    ...order.packs.map((p) => `<b>Готовый бокс:</b> ${e(p.title)} × ${p.qty} — ${formatRub(p.price * p.qty)}`),
    "",
    `👤 ${e(order.customerName)}, ${e(order.phone)}${order.telegram ? `, ${e(order.telegram)}` : ""}`,
    `📦 ${e(order.deliveryMethod)}${order.deliveryZone ? ` (${e(order.deliveryZone)})` : ""}: ${e(order.address)}`,
    order.comment ? `💬 ${e(order.comment)}` : "",
    "",
    `Товары: ${formatRub(order.subtotal)} · Доставка: ${formatRub(order.deliveryPrice)}`,
    `<b>Итого: ${formatRub(order.total)}</b>`,
    `${siteUrl()}/admin/orders/${order.id}`,
  ];
  await sendTelegram(lines.filter((l, i, arr) => l !== "" || arr[i - 1] !== "").join("\n"));
}
