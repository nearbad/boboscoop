"use client";

import { useState } from "react";
import type { Tier } from "@/lib/pricing";

export function TiersEditor({ initial }: { initial: Tier[] }) {
  const [rows, setRows] = useState(initial.map((t, i) => ({ ...t, key: i })));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-2">
          <input name="tierSpoons" type="number" min={1} defaultValue={r.spoons} aria-label="Ложек" className="w-20 rounded-xl border-2 border-line px-3 py-2 text-base" />
          <span className="text-sm text-ink-soft">ложек →</span>
          <input name="tierPrice" type="number" min={0} defaultValue={r.price} aria-label="Цена" className="w-28 rounded-xl border-2 border-line px-3 py-2 text-base" />
          <span className="text-sm text-ink-soft">₽</span>
          <button
            type="button"
            onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}
            disabled={rows.length === 1}
            className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-ink-soft hover:bg-pink-soft disabled:opacity-30"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { spoons: (prev.at(-1)?.spoons ?? 0) + 1, price: 0, key: Date.now() }])}
        className="min-h-10 rounded-full border-2 border-dashed border-line px-3 text-sm font-bold text-ink-soft hover:border-teal"
      >
        + вариант
      </button>
    </div>
  );
}
