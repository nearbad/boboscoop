"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-context";

const NAV = [
  { href: "/#builder", label: "Собрать бокс" },
  { href: "/#assortment", label: "Ассортимент" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#faq", label: "Вопросы" },
];

export function SiteHeader({ showReviews = false }: { showReviews?: boolean }) {
  const { boxes, hydrated } = useCart();
  const count = hydrated ? boxes.length : 0;
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-teal" aria-label="BoboScoop, на главную">
          <Image src="/icon.png" alt="" width={40} height={40} className="h-10 w-10" priority />
          <span className="text-xl">BoboScoop</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Разделы">
          {NAV.filter((n) => showReviews || n.href !== "/#reviews").map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-sm font-bold text-ink-soft transition hover:bg-pink-soft hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/cart"
          className="ml-auto flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-pop transition active:translate-y-1 active:shadow-none md:ml-2"
        >
          <span aria-hidden>🛍️</span>
          <span>Корзина</span>
          <span
            key={count}
            className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs ${count ? "animate-pop bg-pink-deep text-white" : "bg-lilac-soft text-ink-soft"}`}
            aria-label={`${count} в корзине`}
          >
            {count}
          </span>
        </Link>
      </div>
    </header>
  );
}
