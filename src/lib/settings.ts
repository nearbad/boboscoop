import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";

const tierSchema = z.object({
  spoons: z.coerce.number().int().min(1).max(20),
  price: z.coerce.number().int().min(0),
});

export const settingsSchema = z.object({
  acceptingOrders: z.boolean().default(true),
  closedMessage: z
    .string()
    .default("Сейчас мы не принимаем новые заказы: собираем уже оформленные боксы. Следите за новостями в Telegram 💜"),

  tiers: z
    .array(tierSchema)
    .min(1)
    .default([
      { spoons: 1, price: 2000 },
      { spoons: 2, price: 3800 },
      { spoons: 3, price: 5500 },
    ]),
  videoPrice: z.coerce.number().int().min(0).default(300),
  avgItems: z.coerce.number().int().min(0).default(22),
  maxBoxes: z.coerce.number().int().min(1).max(50).default(5),

  characters: z
    .array(z.string())
    .default([
      "Hello Kitty",
      "My Melody",
      "Kuromi",
      "Cinnamoroll",
      "Pompompurin",
      "Pochacco",
      "Keroppi",
      "Badtz-Maru",
      "Little Twin Stars",
      "Hangyodon",
      "Chiikawa",
      "Hachiware",
      "Usagi",
    ]),
  colors: z
    .array(z.string())
    .default(["Розовый", "Сиреневый", "Голубой", "Мятный", "Жёлтый", "Белый", "Чёрный", "Красный"]),

  heroTitle: z.string().default("Сюрприз-боксы в тематике Sanrio и Chiikawa"),
  heroSubtitle: z
    .string()
    .default("Собираем подарок ложечками: чем больше ложек, тем больше милоты. В среднем в бокс входит ~{items} предметов 💓"),
  videoNote: z
    .string()
    .default(
      "На каждый ролик уходит от 1,5 до 3 часов, поэтому запись видео платная. Но если бокс получится особенно красивым, сниму его бесплатно!",
    ),
  wishesNote: z
    .string()
    .default(
      "Мы очень постараемся учесть все ваши пожелания 💜 Но сюрприз-бокс собирается из того, что есть в наличии, поэтому мы не можем гарантировать каждую позицию. Если чего-то не окажется, заменим похожим и таким же милым!",
    ),
  deliveryNote: z
    .string()
    .default("Отправляем через Яндекс Маркет, Ozon или Wildberries до выбранного пункта выдачи."),
  aboutTitle: z.string().default("Знакомьтесь, Боботик!"),
  aboutText: z
    .string()
    .default(
      "Боботик — наш маскот и главный помощник. Он следит, чтобы в каждый бокс попало побольше милоты, проверяет мягкость плюшевых игрушек и очень любит бабл-ти. Иногда он появляется в наших видео, так что подписывайтесь!",
    ),

  telegramUrl: z.string().default("https://t.me/boboscoop"),
  instagramUrl: z.string().default("https://www.instagram.com/bobo.scoop"),
  tiktokUrl: z.string().default("https://www.tiktok.com/@bobo.scoop"),

  sellerInfo: z.string().default("Самозанятый Иванова И. И., ИНН 000000000000"),
  contactEmail: z.string().default(""),
  offerText: z
    .string()
    .default("Здесь будет текст публичной оферты. Отредактируйте его в админке → Настройки."),
  privacyText: z
    .string()
    .default("Здесь будет политика обработки персональных данных. Отредактируйте её в админке → Настройки."),
});

export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = settingsSchema.parse({});

export async function getSettings(): Promise<Settings> {
  const row = await db.query.settings.findFirst({ where: eq(schema.settings.id, 1) });
  const parsed = settingsSchema.safeParse(row?.data ?? {});
  if (!parsed.success) return defaultSettings;
  const s = parsed.data;
  s.tiers = [...s.tiers].sort((a, b) => a.spoons - b.spoons);
  return s;
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const data = settingsSchema.parse({ ...current, ...patch });
  await db
    .insert(schema.settings)
    .values({ id: 1, data })
    .onConflictDoUpdate({ target: schema.settings.id, set: { data, updatedAt: new Date() } });
}
