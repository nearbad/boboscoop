"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayButton({ orderId, demo }: { orderId: string; demo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/${demo ? "demo-pay" : "pay"}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не получилось");
      if (demo) {
        router.replace(`/order/${orderId}`);
        router.refresh();
      } else {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не получилось");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="w-full rounded-full border-2 border-ink bg-pink-deep px-6 py-3.5 text-lg font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none disabled:opacity-50"
      >
        {busy ? "Секундочку…" : demo ? "Оплатить (демо)" : "Перейти к оплате"}
      </button>
      {demo && (
        <p className="mt-2 text-xs text-ink-soft">
          Демо-режим: ключи ЮKassa ещё не подключены, оплата будет имитирована.
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm font-bold text-pink-deep" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
