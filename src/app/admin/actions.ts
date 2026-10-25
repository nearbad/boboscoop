"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { ADMIN_COOKIE, adminCookieOptions, createAdminToken } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { RARITIES, type Rarity } from "@/lib/capsule";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { markPaid } from "@/lib/orders";
import { defaultSettings, saveSettings, settingsSchema } from "@/lib/settings";
import { saveImage, saveImages } from "@/lib/upload";

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
  // Marking an unpaid order as paid by hand (e.g. a bank transfer) goes through the normal
  // payment flow: stock, capsule prizes and the Telegram notification.
  if (status === "paid") {
    const current = await db.query.orders.findFirst({ where: eq(schema.orders.id, id) });
    if (current?.status === "pending_payment") await markPaid(id, null);
  }
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

// Ready-made packs

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .split("")
      .map((c) => TRANSLIT[c] ?? c)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "box"
  );
}

export async function savePack(_prev: ActionState, f: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = int(f, "id");
    const current = id ? await db.query.packs.findFirst({ where: eq(schema.packs.id, id) }) : undefined;
    const removed = new Set(f.getAll("removeImages").map(String));
    const kept = (current?.images ?? []).filter((u) => !removed.has(u));
    const images = [...kept, ...(await saveImages(f.getAll("images")))];
    const stockRaw = text(f, "stock");
    const values = {
      title: text(f, "title"),
      slug: slugify(text(f, "slug") || text(f, "title")),
      description: text(f, "description"),
      price: int(f, "price"),
      images,
      itemsCount: text(f, "itemsCount") ? int(f, "itemsCount") : null,
      badge: text(f, "badge"),
      stock: stockRaw === "" ? null : Math.max(0, int(f, "stock")),
      maxPerOrder: Math.max(1, int(f, "maxPerOrder") || 1),
      available: bool(f, "available"),
      sort: int(f, "sort"),
    };
    if (!values.title) return { error: "Укажите название" };
    if (values.price <= 0) return { error: "Укажите цену" };
    const clash = await db.query.packs.findFirst({ where: eq(schema.packs.slug, values.slug) });
    if (clash && clash.id !== id) return { error: `Адрес «${values.slug}» уже занят другим боксом` };
    if (id) await db.update(schema.packs).set(values).where(eq(schema.packs.id, id));
    else await db.insert(schema.packs).values(values);
    done();
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка" };
  }
}

export async function deletePack(f: FormData) {
  await requireAdmin();
  await db.delete(schema.packs).where(eq(schema.packs.id, int(f, "id")));
  done();
}

// Reviews

// Creates one review per uploaded screenshot.
export async function uploadReviewScreenshots(_prev: ActionState, f: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const urls = await saveImages(f.getAll("images"));
    if (urls.length === 0) return { error: "Выберите скриншоты" };
    await db.insert(schema.reviews).values(urls.map((imageUrl, i) => ({ imageUrl, sort: -urls.length + i, visible: true })));
    done();
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка" };
  }
}

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
    if (!values.text && !values.imageUrl) return { error: "Добавьте текст или скриншот" };
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
    maxExclude: text(f, "maxExclude"),
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

// Капсула Боботика

export async function saveCapsulePrize(_prev: ActionState, f: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = int(f, "id");
    const current = id ? await db.query.capsulePrizes.findFirst({ where: eq(schema.capsulePrizes.id, id) }) : undefined;
    const rarity = text(f, "rarity") as Rarity;
    const stockRaw = text(f, "stock");
    const values = {
      name: text(f, "name"),
      description: text(f, "description"),
      emoji: text(f, "emoji") || "🎁",
      rarity: RARITIES.includes(rarity) ? rarity : "common",
      weight: Math.max(0, int(f, "weight")),
      stock: stockRaw === "" ? null : Math.max(0, int(f, "stock")),
      cost: Math.max(0, int(f, "cost")),
      active: bool(f, "active"),
      sort: int(f, "sort"),
      imageUrl: await imageField(f, current?.imageUrl ?? null),
    };
    if (!values.name) return { error: "Укажите название приза" };
    if (id) await db.update(schema.capsulePrizes).set(values).where(eq(schema.capsulePrizes.id, id));
    else await db.insert(schema.capsulePrizes).values(values);
    done();
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Ошибка" };
  }
}

export async function deleteCapsulePrize(f: FormData) {
  await requireAdmin();
  // Won capsules keep a copy of the prize, so deleting it doesn't affect past orders.
  await db.delete(schema.capsulePrizes).where(eq(schema.capsulePrizes.id, int(f, "id")));
  done();
}

export async function updateCapsuleSettings(_prev: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const minSpoons = int(f, "capsuleMinSpoons");
  if (minSpoons < 1) return { error: "Укажите, со скольки ложек выдаётся капсула" };
  await saveSettings({
    capsuleEnabled: bool(f, "capsuleEnabled"),
    capsuleMinSpoons: minSpoons,
    capsuleRules: text(f, "capsuleRules") || defaultSettings.capsuleRules,
  });
  done();
  return { ok: true };
}
