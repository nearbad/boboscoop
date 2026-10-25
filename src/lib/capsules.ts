import "server-only";
import { randomInt } from "node:crypto";
import { and, asc, desc, eq, gt, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Capsule, CapsulePrize, Order } from "@/lib/db/schema";
import type { RevealedPrize } from "@/lib/capsule";
import type { Settings } from "@/lib/settings";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function isDrawable(p: CapsulePrize): boolean {
  return p.active && p.weight > 0 && (p.stock === null || p.stock > 0);
}

export async function getPrizePool(): Promise<{ prizes: CapsulePrize[]; totalWeight: number }> {
  const prizes = await db
    .select()
    .from(schema.capsulePrizes)
    .where(eq(schema.capsulePrizes.active, true))
    .orderBy(asc(schema.capsulePrizes.sort), asc(schema.capsulePrizes.id));
  const totalWeight = prizes.filter(isDrawable).reduce((s, p) => s + p.weight, 0);
  return { prizes, totalWeight };
}

// Capsules are offered only while the feature is on and at least one prize can be drawn.
export async function capsuleMinSpoons(settings: Settings): Promise<number | null> {
  if (!settings.capsuleEnabled) return null;
  const { totalWeight } = await getPrizePool();
  return totalWeight > 0 ? settings.capsuleMinSpoons : null;
}

// Weighted random pick; a prize with limited stock is reserved atomically,
// and if someone else took the last one we draw again.
async function drawPrize(tx: Tx): Promise<CapsulePrize | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const pool = await tx
      .select()
      .from(schema.capsulePrizes)
      .where(
        and(
          eq(schema.capsulePrizes.active, true),
          gt(schema.capsulePrizes.weight, 0),
          or(isNull(schema.capsulePrizes.stock), gt(schema.capsulePrizes.stock, 0)),
        ),
      )
      .orderBy(asc(schema.capsulePrizes.id));
    const total = pool.reduce((s, p) => s + p.weight, 0);
    if (total <= 0) return null;

    let roll = randomInt(total);
    const pick = pool.find((p) => (roll -= p.weight) < 0)!;
    if (pick.stock === null) return pick;

    const [reserved] = await tx
      .update(schema.capsulePrizes)
      .set({ stock: sql`${schema.capsulePrizes.stock} - 1` })
      .where(and(eq(schema.capsulePrizes.id, pick.id), gt(schema.capsulePrizes.stock, 0)))
      .returning();
    if (reserved) return reserved;
  }
  return null;
}

// Draws a prize for every box that earned a capsule. Runs inside the "mark as paid" transaction.
export async function drawCapsules(tx: Tx, order: Order): Promise<Capsule[]> {
  const won: Capsule[] = [];
  for (const [boxIndex, box] of order.boxes.entries()) {
    if (!box.capsule) continue;
    const prize = await drawPrize(tx);
    if (!prize) continue;
    const [capsule] = await tx
      .insert(schema.capsules)
      .values({
        orderId: order.id,
        boxIndex,
        prizeId: prize.id,
        prizeName: prize.name,
        prizeDescription: prize.description,
        prizeEmoji: prize.emoji,
        prizeImageUrl: prize.imageUrl,
        rarity: prize.rarity,
      })
      .onConflictDoNothing()
      .returning();
    if (capsule) won.push(capsule);
  }
  return won;
}

export function toRevealed(c: Capsule): RevealedPrize {
  return {
    name: c.prizeName,
    description: c.prizeDescription,
    emoji: c.prizeEmoji,
    imageUrl: c.prizeImageUrl,
    rarity: c.rarity,
  };
}

export async function getOrderCapsules(orderId: string): Promise<Capsule[]> {
  return db.select().from(schema.capsules).where(eq(schema.capsules.orderId, orderId)).orderBy(asc(schema.capsules.boxIndex));
}

// Marks the capsule as opened (once) and returns its prize.
export async function openCapsule(orderId: string, capsuleId: number): Promise<RevealedPrize | null> {
  const [capsule] = await db
    .update(schema.capsules)
    .set({ openedAt: sql`coalesce(${schema.capsules.openedAt}, now())` })
    .where(and(eq(schema.capsules.id, capsuleId), eq(schema.capsules.orderId, orderId)))
    .returning();
  return capsule ? toRevealed(capsule) : null;
}

// Only opened capsules are shown publicly, so the feed never spoils someone's surprise.
export async function getRecentWins(limit = 8): Promise<Capsule[]> {
  return db
    .select()
    .from(schema.capsules)
    .where(isNotNull(schema.capsules.openedAt))
    .orderBy(desc(schema.capsules.openedAt))
    .limit(limit);
}

export async function getCapsuleStats() {
  const [totals] = await db
    .select({
      issued: sql<number>`count(*)::int`,
      opened: sql<number>`count(${schema.capsules.openedAt})::int`,
    })
    .from(schema.capsules);
  const perPrize = await db
    .select({ prizeId: schema.capsules.prizeId, n: sql<number>`count(*)::int` })
    .from(schema.capsules)
    .groupBy(schema.capsules.prizeId);
  return { issued: totals?.issued ?? 0, opened: totals?.opened ?? 0, perPrize };
}

// Everything the public pages need to present the capsule.
export async function getCapsuleShowcase(settings: Settings) {
  const [{ prizes, totalWeight }, wins] = await Promise.all([getPrizePool(), getRecentWins()]);
  const minSpoons = settings.capsuleEnabled && totalWeight > 0 ? settings.capsuleMinSpoons : null;
  return { minSpoons, prizes, totalWeight, wins };
}
