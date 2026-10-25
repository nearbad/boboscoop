"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";

// Adds a ready-made box to the cart; the quantity is capped by stock and the per-order limit.
export function AddPackButton({ packId, limit, compact = false }: { packId: number; limit: number; compact?: boolean }) {
  const cart = useCart();
  const qty = cart.packs.find((p) => p.packId === packId)?.qty ?? 0;
  const soldOut = limit <= 0;

  if (soldOut) {
    return <p className="rounded-full bg-lilac-soft px-4 py-2.5 text-center font-extrabold text-ink-soft">Разобрали 😿</p>;
  }

  if (cart.hydrated && qty > 0) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border-2 border-ink bg-white">
          <button type="button" onClick={() => cart.setPackQty(packId, qty - 1)} className="h-10 w-10 text-xl font-black" aria-label="Убрать один">−</button>
          <span className="min-w-8 text-center font-black" aria-live="polite">{qty}</span>
          <button
            type="button"
            onClick={() => cart.setPackQty(packId, qty + 1)}
            disabled={qty >= limit}
            className="h-10 w-10 text-xl font-black disabled:opacity-30"
            aria-label="Добавить ещё один"
          >
            +
          </button>
        </div>
        {!compact && (
          <Link href="/cart" className="font-bold text-teal-deep underline underline-offset-2">В корзину →</Link>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => cart.setPackQty(packId, 1)}
      className={`rounded-full border-2 border-ink bg-pink-deep font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none ${compact ? "px-5 py-2" : "w-full px-6 py-3.5 text-lg sm:w-auto"}`}
    >
      В корзину
    </button>
  );
}
