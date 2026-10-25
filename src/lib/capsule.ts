// "Капсула Боботика": shared, client-safe bits (rarities, labels, wording).

export const RARITIES = ["common", "rare", "epic", "super"] as const;
export type Rarity = (typeof RARITIES)[number];

// color: capsule shell / pill background (ink text on top), deep: accents and borders.
export const RARITY: Record<Rarity, { label: string; short: string; color: string; deep: string }> = {
  common: { label: "Обычный приз", short: "Обычный", color: "#9fdde1", deep: "#0b7d83" },
  rare: { label: "Редкий приз", short: "Редкий", color: "#a9c8ff", deep: "#2f6fd6" },
  epic: { label: "Эпический приз", short: "Эпический", color: "#d4b5ff", deep: "#7a3fd0" },
  super: { label: "Супер-приз!", short: "Супер-приз", color: "#ffd66b", deep: "#946500" },
};

export type RevealedPrize = {
  name: string;
  description: string;
  emoji: string;
  imageUrl: string | null;
  rarity: Rarity;
};

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function capsulesLabel(n: number): string {
  return `${n} ${plural(n, "капсула", "капсулы", "капсул")}`;
}

// "на 3 ложки" when the capsule comes with the biggest box only, otherwise "от 2 ложек".
export function capsuleSpoonsPhrase(minSpoons: number, maxTier: number): string {
  if (minSpoons >= maxTier) return `на ${minSpoons} ${plural(minSpoons, "ложку", "ложки", "ложек")}`;
  return `от ${minSpoons} ${plural(minSpoons, "ложки", "ложек", "ложек")}`;
}

export function formatChance(weight: number, totalWeight: number): string {
  if (totalWeight <= 0 || weight <= 0) return "0%";
  const p = (weight / totalWeight) * 100;
  return `${p.toLocaleString("ru-RU", { maximumFractionDigits: p < 1 ? 2 : p < 10 ? 1 : 0 })}%`;
}

export function timeAgo(date: Date, now = new Date()): string {
  const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });
  const minutes = Math.round((date.getTime() - now.getTime()) / 60000);
  if (Math.abs(minutes) < 1) return "только что";
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}
