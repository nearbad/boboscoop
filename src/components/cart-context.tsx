"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Box } from "@/lib/pricing";

export type CartBox = Box & { id: string };
export type CartPack = { packId: number; qty: number };

type CartValue = {
  boxes: CartBox[];
  packs: CartPack[];
  count: number;
  hydrated: boolean;
  add: (box: Box) => void;
  update: (id: string, box: Partial<Box>) => void;
  remove: (id: string) => void;
  setPackQty: (packId: number, qty: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "boboscoop-cart-v1";
const CartContext = createContext<CartValue | null>(null);

type Stored = { boxes: CartBox[]; packs: CartPack[] };

function load(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    // The first version stored a bare array of scoop boxes.
    if (Array.isArray(parsed)) return { boxes: parsed, packs: [] };
    return {
      boxes: Array.isArray(parsed?.boxes) ? parsed.boxes : [],
      packs: Array.isArray(parsed?.packs) ? parsed.packs : [],
    };
  } catch {
    return { boxes: [], packs: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [boxes, setBoxes] = useState<CartBox[]>([]);
  const [packs, setPacks] = useState<CartPack[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = load();
    setBoxes(stored.boxes);
    setPacks(stored.packs);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ boxes, packs }));
    } catch {
      // Storage can be unavailable (private mode); the cart still works for this visit.
    }
  }, [boxes, packs, hydrated]);

  const add = useCallback((box: Box) => {
    setBoxes((prev) => [...prev, { ...box, id: crypto.randomUUID() }]);
  }, []);
  const update = useCallback((id: string, patch: Partial<Box>) => {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);
  const remove = useCallback((id: string) => setBoxes((prev) => prev.filter((b) => b.id !== id)), []);
  const setPackQty = useCallback((packId: number, qty: number) => {
    setPacks((prev) => {
      const rest = prev.filter((p) => p.packId !== packId);
      return qty > 0 ? [...rest, { packId, qty }] : rest;
    });
  }, []);
  const clear = useCallback(() => {
    setBoxes([]);
    setPacks([]);
  }, []);

  const count = boxes.length + packs.reduce((s, p) => s + p.qty, 0);
  const value = useMemo(
    () => ({ boxes, packs, count, hydrated, add, update, remove, setPackQty, clear }),
    [boxes, packs, count, hydrated, add, update, remove, setPackQty, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
