"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GachaMachine } from "@/components/gacha-machine";
import { capsulesLabel, RARITY, type Rarity, type RevealedPrize } from "@/lib/capsule";

export type CapsuleItem = { id: number; prize: RevealedPrize | null };
type Phase = "idle" | "spinning" | "dropped" | "opening" | "revealed";

export function PrizeIcon({ prize, size = "md" }: { prize: Pick<RevealedPrize, "emoji" | "imageUrl" | "rarity">; size?: "sm" | "md" | "lg" }) {
  const box = { sm: "h-10 w-10 text-2xl", md: "h-14 w-14 text-3xl", lg: "h-24 w-24 text-6xl" }[size];
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl ${box}`} style={{ background: `${RARITY[prize.rarity].color}66` }}>
      {prize.imageUrl ? <Image src={prize.imageUrl} alt="" fill sizes="96px" className="object-cover" /> : <span aria-hidden>{prize.emoji}</span>}
    </span>
  );
}

// Deterministic pseudo-random spread, so rendering stays pure.
function spread(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function Confetti({ rarity }: { rarity: Rarity }) {
  const count = rarity === "common" ? 14 : rarity === "super" ? 44 : 28;
  const colors = [RARITY[rarity].color, RARITY[rarity].deep, "#f39aa7", "#86cdd3", "#ffd66b"];
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + spread(i, 1) * 0.5;
        const dist = 90 + spread(i, 2) * 80;
        const style = {
          background: colors[i % colors.length],
          "--dx": `${Math.cos(angle) * dist}px`,
          "--dy": `${Math.sin(angle) * dist - 30}px`,
          "--rot": `${spread(i, 3) * 540 - 270}deg`,
          animationDelay: `${spread(i, 4) * 0.15}s`,
        } as React.CSSProperties;
        return <span key={i} className={`confetti-piece absolute h-2.5 w-2.5 ${i % 3 === 0 ? "rounded-full" : "rounded-[2px]"}`} style={style} />;
      })}
    </div>
  );
}

export function RarityPill({ rarity, long = false }: { rarity: Rarity; long?: boolean }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-black text-ink" style={{ background: RARITY[rarity].color }}>
      {long ? RARITY[rarity].label : RARITY[rarity].short}
    </span>
  );
}

export function CapsuleOpener({ orderId, items: initial }: { orderId: string; items: CapsuleItem[] }) {
  const [items, setItems] = useState(initial);
  const [phase, setPhase] = useState<Phase>("idle");
  const [current, setCurrent] = useState<RevealedPrize | null>(null);
  const [error, setError] = useState<string | null>(null);

  const left = items.filter((i) => !i.prize).length;
  const won = items.flatMap((i) => (i.prize ? [{ id: i.id, prize: i.prize }] : []));

  async function open() {
    const next = items.find((i) => !i.prize);
    if (!next || phase !== "idle") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
    setError(null);
    setPhase("spinning");
    try {
      const [res] = await Promise.all([fetch(`/api/orders/${orderId}/capsules/${next.id}`, { method: "POST" }), wait(1100)]);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не получилось открыть капсулу");
      const prize: RevealedPrize = data.prize;
      setCurrent(prize);
      setPhase("dropped");
      await wait(750);
      setPhase("opening");
      await wait(1550);
      // The prize joins the list only now, so it can't be spotted before the capsule opens.
      setItems((prev) => prev.map((i) => (i.id === next.id ? { ...i, prize } : i)));
      setPhase("revealed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не получилось открыть капсулу");
      setPhase("idle");
    }
  }

  function close() {
    setPhase("idle");
    setCurrent(null);
  }

  const shell = current ? RARITY[current.rarity].color : undefined;

  return (
    <section className="rounded-[2.5rem] border-2 border-ink bg-white p-6 shadow-pop sm:p-8" aria-labelledby="capsules-title">
      <div className="grid items-center gap-8 md:grid-cols-[260px_1fr]">
        <div className="relative">
          <GachaMachine spinning={phase === "spinning"} drop={phase === "dropped" ? shell : null} />
          {current && (phase === "opening" || phase === "revealed") && (
            // -inset-x-6 also covers the mascot peeking out on the left of the machine.
            <div className="absolute inset-y-0 -inset-x-6 grid place-items-center rounded-3xl bg-cream/70 backdrop-blur-[2px]">
              <div className="capsule-big relative h-28 w-28 [grid-area:1/1]">
                <span className="capsule-top absolute inset-x-0 top-0 h-1/2 rounded-t-full border-4 border-b-2 border-ink" style={{ background: shell }} />
                <span className="capsule-bottom absolute inset-x-0 bottom-0 h-1/2 rounded-b-full border-4 border-t-2 border-ink bg-white" />
              </div>
              {phase === "revealed" && (
                <>
                  <Confetti rarity={current.rarity} />
                  <div className="prize-in relative z-10 mx-2 w-[min(100%,240px)] rounded-3xl border-2 border-ink bg-white p-4 text-center shadow-pop [grid-area:1/1]">
                    <RarityPill rarity={current.rarity} long />
                    <div className="mt-3 flex justify-center">
                      <PrizeIcon prize={current} size="lg" />
                    </div>
                    <p className="mt-3 text-lg font-black leading-tight">{current.name}</p>
                    {current.description && <p className="mt-1 text-xs text-ink-soft">{current.description}</p>}
                    <button
                      type="button"
                      onClick={close}
                      autoFocus
                      className="mt-4 rounded-full border-2 border-ink bg-pink-deep px-5 py-2 font-black text-white shadow-pop active:translate-y-1 active:shadow-none"
                    >
                      Ура! 💜
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase tracking-widest text-pink-deep">Подарок к заказу</p>
          <h2 id="capsules-title" className="mt-1 text-3xl font-black">Капсула Боботика 🎁</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            {left > 0
              ? `У вас ${won.length ? "ещё " : ""}${capsulesLabel(left)}! Приз уже определён и приедет в вашей посылке. Крутите ручку, чтобы узнать, какой.`
              : "Все капсулы открыты! Призы положим в вашу посылку."}
          </p>
          {left > 0 && (
            <button
              type="button"
              onClick={open}
              disabled={phase !== "idle"}
              className="mt-5 rounded-full border-2 border-ink bg-pink-deep px-7 py-3.5 text-lg font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {phase !== "idle" ? "Крутим…" : won.length ? "Открыть следующую" : "Крутить ручку"}
            </button>
          )}
          {error && (
            <p className="mt-3 text-sm font-bold text-pink-deep" role="alert">
              {error}
            </p>
          )}
          {won.length > 0 && (
            <ul className="mt-6 space-y-2">
              {won.map(({ id, prize }) => (
                <li key={id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                  <PrizeIcon prize={prize} size="sm" />
                  <span className="min-w-0">
                    <span className="block font-extrabold leading-tight">{prize.name}</span>
                    <RarityPill rarity={prize.rarity} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 text-sm">
            <Link href="/capsule" className="tap font-bold text-teal-deep underline underline-offset-2">
              Какие призы бывают и шансы
            </Link>
          </p>
          <p className="sr-only" aria-live="polite">
            {phase === "revealed" && current ? `Вам выпало: ${RARITY[current.rarity].label} ${current.name}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
