// Shared between the browser (cart, calculator) and the server (order creation).
// The server always recomputes prices; client values are only for display.

export type Tier = { spoons: number; price: number };

export type Wishes = {
  characters: string[];
  colors: string[];
  exclude: string[];
  comment: string;
};

export type Box = {
  spoons: number;
  video: boolean;
  wishes: Wishes;
};

// capsule: the box earned a "Капсула Боботика" when the order was placed.
export type OrderBox = Box & { price: number; capsule?: boolean };

export type OrderPack = { packId: number; title: string; price: number; qty: number };

export type PricingSettings = {
  tiers: Tier[];
  videoPrice: number;
  maxBoxes: number;
};

export const emptyWishes = (): Wishes => ({ characters: [], colors: [], exclude: [], comment: "" });

export function tierPrice(s: PricingSettings, spoons: number): number | null {
  return s.tiers.find((t) => t.spoons === spoons)?.price ?? null;
}

export function boxPrice(s: PricingSettings, box: Pick<Box, "spoons" | "video">): number | null {
  const base = tierPrice(s, box.spoons);
  if (base === null) return null;
  return base + (box.video ? s.videoPrice : 0);
}

export function cartSubtotal(s: PricingSettings, boxes: Box[]): number {
  return boxes.reduce((sum, b) => sum + (boxPrice(s, b) ?? 0), 0);
}

export function packsSubtotal(packs: { price: number; qty: number }[]): number {
  return packs.reduce((sum, p) => sum + p.price * p.qty, 0);
}

export function maxSpoons(s: PricingSettings): number {
  return Math.max(0, ...s.tiers.map((t) => t.spoons));
}

export function formatRub(n: number): string {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

export function spoonsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ложка`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ложки`;
  return `${n} ложек`;
}

export function boxesLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} бокс`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} бокса`;
  return `${n} боксов`;
}
