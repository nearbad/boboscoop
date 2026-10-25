import { PrizeIcon, RarityPill } from "@/components/capsule-opener";
import { formatChance, RARITIES, RARITY, timeAgo } from "@/lib/capsule";
import type { Capsule, CapsulePrize } from "@/lib/db/schema";

function inStock(p: CapsulePrize) {
  return p.weight > 0 && (p.stock === null || p.stock > 0);
}

// Prize pool grouped by rarity, rarest first, with the chance of each prize.
export function PrizeOdds({ prizes, totalWeight }: { prizes: CapsulePrize[]; totalWeight: number }) {
  return (
    <div className="space-y-4">
      {[...RARITIES].reverse().map((rarity) => {
        const group = prizes.filter((p) => p.rarity === rarity);
        if (group.length === 0) return null;
        const groupWeight = group.filter(inStock).reduce((s, p) => s + p.weight, 0);
        return (
          <section key={rarity} className="rounded-blob border-2 bg-white p-5" style={{ borderColor: RARITY[rarity].color }}>
            <h3 className="flex flex-wrap items-center justify-between gap-2">
              <RarityPill rarity={rarity} long />
              <span className="text-sm font-extrabold text-ink-soft">шанс {formatChance(groupWeight, totalWeight)}</span>
            </h3>
            <ul className="mt-3 divide-y divide-line">
              {group.map((p) => (
                <li key={p.id} className={`flex items-center gap-3 py-3 ${inStock(p) ? "" : "opacity-50"}`}>
                  <PrizeIcon prize={p} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold leading-tight">{p.name}</p>
                    {p.description && <p className="text-sm text-ink-soft">{p.description}</p>}
                    {p.stock !== null && (
                      <p className="text-xs font-bold text-pink-deep">{p.stock > 0 ? `осталось ${p.stock} шт.` : "уже разыграли"}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-black">{inStock(p) ? formatChance(p.weight, totalWeight) : "—"}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function RecentWins({ wins }: { wins: Capsule[] }) {
  const now = new Date();
  return (
    <ul className="space-y-2">
      {wins.map((w) => (
        <li key={w.id} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4">
          <PrizeIcon prize={{ emoji: w.prizeEmoji, imageUrl: w.prizeImageUrl, rarity: w.rarity }} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-extrabold leading-tight">{w.prizeName}</span>
            <RarityPill rarity={w.rarity} />
          </span>
          <span className="shrink-0 text-xs text-ink-soft">{w.openedAt ? timeAgo(w.openedAt, now) : ""}</span>
        </li>
      ))}
    </ul>
  );
}

// Highlights: the most valuable prize of each rarity, rarest first.
export function TopPrizes({ prizes }: { prizes: CapsulePrize[] }) {
  const picks = [...RARITIES]
    .reverse()
    .map((r) => prizes.filter((p) => p.rarity === r && inStock(p)).sort((a, b) => b.cost - a.cost)[0])
    .filter(Boolean);
  return (
    <ul className="flex flex-wrap gap-2">
      {picks.map((p) => (
        <li key={p.id} className="rounded-full px-3 py-1.5 text-sm font-bold text-ink" style={{ background: RARITY[p.rarity].color }}>
          {p.emoji} {p.name}
        </li>
      ))}
    </ul>
  );
}
