"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Box } from "@/lib/pricing";

export type CartBox = Box & { id: string };

type CartValue = {
  boxes: CartBox[];
  hydrated: boolean;
  add: (box: Box) => void;
  update: (id: string, box: Partial<Box>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "boboscoop-cart-v1";
const CartContext = createContext<CartValue | null>(null);

function load(): CartBox[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [boxes, setBoxes] = useState<CartBox[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBoxes(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
    } catch {
      // Storage can be unavailable (private mode); the cart still works for this visit.
    }
  }, [boxes, hydrated]);

  const add = useCallback((box: Box) => {
    setBoxes((prev) => [...prev, { ...box, id: crypto.randomUUID() }]);
  }, []);
  const update = useCallback((id: string, patch: Partial<Box>) => {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);
  const remove = useCallback((id: string) => setBoxes((prev) => prev.filter((b) => b.id !== id)), []);
  const clear = useCallback(() => setBoxes([]), []);

  const value = useMemo(() => ({ boxes, hydrated, add, update, remove, clear }), [boxes, hydrated, add, update, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
