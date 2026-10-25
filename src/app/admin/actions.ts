"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { saveSettings, settingsSchema } from "@/lib/settings";
import { saveImage } from "@/lib/upload";

export type ActionState = { ok?: boolean; error?: string } | null;

const text = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => {
  const n = Number.parseInt(text(f, k), 10);
  return Number.isFinite(n) ? n : 0;
};
const bool = (f: FormData, k: string) => f.get(k) === "on";
const lines = (f: FormData, k: string) =>
  text(f, k)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function done() {
  revalidatePath("/", "layout");
}

// Image fields: a new upload wins, "remove" clears it, otherwise keep the current value.
async function imageField(f: FormData, current: string | null = null) {
  const uploaded = await saveImage(f.get("image"));
  if (uploaded) return uploaded;
  if (bool(f, "removeImage")) return null;
  return current;
}

export async function login(_prev: ActionState, f: FormData): Promise<ActionState> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "ADMIN_PASSWORD не задан в переменных окружения" };
  if (text(f, "password") !== expected) return { error: "Неверный пароль" };
  (await cookies()).set(ADMIN_COOKIE, await createAdminToken(), adminCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// Orders

export async function updateOrder(f: FormData) {
  await requireAdmin();
  const id = text(f, "id");
  const status = text(f, "status") as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) throw new Error("Bad status");
  await db
    .update(schema.orders)
    .set({ status, adminNote: text(f, "adminNote") })
    .where(eq(schema.orders.id, id));
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}

// Products

export async function saveProduct(_prev: ActionState, f: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = int(f, "id");
    const current = id ? await db.query.products.findFirst({ where: eq(schema.products.id, id) }) : undefined;
    const values = {
      name: text(f, "name"),
      emoji: text(f, "emoji") || "🎀",
      description: text(f, "description"),
      available: bool(f, "available"),
      sort: int(f, "sort"),
      imageUrl: await imageField(f, current?.imageUrl ?? null),
    };
    if (!values.name) return { error: "Укажите название" };
    if (id) await db.update(schema.products).set(values).where(eq(schema.products.id, id));
    else await db.insert(schema.products).values(values);
    done();
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка" };
  }
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  await db.delete(schema.products).where(eq(schema.products.id, int(f, "id")));
  done();
}

// Delivery

export async function saveDeliveryMethod(_prev: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = int(f, "id");
  const values = {
    name: text(f, "name"),
    price: int(f, "price"),
    note: text(f, "note"),
    active: bool(f, "active"),
    sort: int(f, "sort"),
  };
  if (!values.name) return { error: "Укажите название" };
  if (id) await db.update(schema.deliveryMethods).set(values).where(eq(schema.deliveryMethods.id, id));
  else await db.insert(schema.deliveryMethods).values(values);
  done();
  return { ok: true };
}

export async function deleteDeliveryMethod(f: FormData) {
  await requireAdmin();
  await db.delete(schema.deliveryMethods).where(eq(schema.deliveryMethods.id, int(f, "id")));
  done();
}

export async function saveDeliveryZone(_prev: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = int(f, "id");
  const values = { name: text(f, "name"), extra: int(f, "extra"), active: bool(f, "active"), sort: int(f, "sort") };
  if (!values.name) return { error: "Укажите название" };
  if (id) await db.update(schema.deliveryZones).set(values).where(eq(schema.deliveryZones.id, id));
  else await db.insert(schema.deliveryZones).values(values);
  done();
  return { ok: true };
}

export async function deleteDeliveryZone(f: FormData) {
  await requireAdmin();
  await db.delete(schema.deliveryZones).where(eq(schema.deliveryZones.id, int(f, "id")));
  done();
}

// Reviews

export async function saveReview(_prev: ActionState, f: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = int(f, "id");
    const current = id ? await db.query.reviews.findFirst({ where: eq(schema.reviews.id, id) }) : undefined;
    const values = {
      author: text(f, "author"),
      text: text(f, "text"),
      rating: Math.min(5, Math.max(1, int(f, "rating") || 5)),
      visible: bool(f, "visible"),
      sort: int(f, "sort"),
      imageUrl: await imageField(f, current?.imageUrl ?? null),
    };
    if (!values.author || !values.text) return { error: "Заполните автора и текст" };
    if (id) await db.update(schema.reviews).set(values).where(eq(schema.reviews.id, id));
    else await db.insert(schema.reviews).values(values);
    done();
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка" };
  }
}

export async function deleteReview(f: FormData) {
  await requireAdmin();
  await db.delete(schema.reviews).where(eq(schema.reviews.id, int(f, "id")));
  done();
}

// FAQ

export async function saveFaq(_prev: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = int(f, "id");
  const values = { question: text(f, "question"), answer: text(f, "answer"), visible: bool(f, "visible"), sort: int(f, "sort") };
  if (!values.question || !values.answer) return { error: "Заполните вопрос и ответ" };
  if (id) await db.update(schema.faq).set(values).where(eq(schema.faq.id, id));
  else await db.insert(schema.faq).values(values);
  done();
  return { ok: true };
}

export async function deleteFaq(f: FormData) {
  await requireAdmin();
  await db.delete(schema.faq).where(eq(schema.faq.id, int(f, "id")));
  done();
}

// Settings

export async function updateSettings(_prev: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const spoons = f.getAll("tierSpoons").map(String);
  const prices = f.getAll("tierPrice").map(String);
  const tiers = spoons
    .map((s, i) => ({ spoons: Number(s), price: Number(prices[i]) }))
    .filter((t) => t.spoons > 0);
  if (new Set(tiers.map((t) => t.spoons)).size !== tiers.length) {
    return { error: "Количество ложек в тарифах не должно повторяться" };
  }

  const parsed = settingsSchema.safeParse({
    acceptingOrders: bool(f, "acceptingOrders"),
    closedMessage: text(f, "closedMessage"),
    tiers,
    videoPrice: text(f, "videoPrice"),
    avgItems: text(f, "avgItems"),
    maxBoxes: text(f, "maxBoxes"),
    characters: lines(f, "characters"),
    colors: lines(f, "colors"),
    heroTitle: text(f, "heroTitle"),
    heroSubtitle: text(f, "heroSubtitle"),
    videoNote: text(f, "videoNote"),
    wishesNote: text(f, "wishesNote"),
    deliveryNote: text(f, "deliveryNote"),
    aboutTitle: text(f, "aboutTitle"),
    aboutText: text(f, "aboutText"),
    telegramUrl: text(f, "telegramUrl"),
    instagramUrl: text(f, "instagramUrl"),
    tiktokUrl: text(f, "tiktokUrl"),
    sellerInfo: text(f, "sellerInfo"),
    contactEmail: text(f, "contactEmail"),
    offerText: text(f, "offerText"),
    privacyText: text(f, "privacyText"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `Проверьте поле «${issue?.path.join(".")}»: ${issue?.message}` };
  }
  await saveSettings(parsed.data);
  done();
  return { ok: true };
}

export async function toggleProductAvailable(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  const p = await db.query.products.findFirst({ where: eq(schema.products.id, id) });
  if (!p) return;
  await db.update(schema.products).set({ available: !p.available }).where(eq(schema.products.id, id));
  done();
}
