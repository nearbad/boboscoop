import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { isDemoPayments } from "@/lib/yookassa";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Админка · BoboScoop", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "📦 Заказы" },
  { href: "/admin/packs", label: "🎁 Готовые боксы" },
  { href: "/admin/products", label: "🎀 Ассортимент" },
  { href: "/admin/settings", label: "💰 Цены и тексты" },
  { href: "/admin/delivery", label: "🚚 Доставка" },
  { href: "/admin/reviews", label: "⭐ Отзывы" },
  { href: "/admin/faq", label: "❓ FAQ" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoPayments();
  const telegram = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  return (
    <div className="min-h-dvh bg-lilac-soft/60">
      <header className="border-b-2 border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 font-black text-teal">
            <Image src="/icon.png" alt="" width={32} height={32} />
            Админка
          </Link>
          <nav className="order-last flex w-full gap-1 overflow-x-auto pb-1 md:order-none md:w-auto md:pb-0">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft hover:bg-pink-soft hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="text-sm font-bold text-ink-soft underline underline-offset-2">Сайт ↗</Link>
            <form action={logout}>
              <button className="rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft hover:bg-pink-soft">Выйти</button>
            </form>
          </div>
        </div>
      </header>
      {(demo || !telegram) && (
        <div className="mx-auto mt-4 max-w-6xl space-y-2 px-4 text-sm">
          {demo && (
            <p className="rounded-2xl bg-pink-soft p-3 font-bold">
              Оплата в демо-режиме: ключи ЮKassa не заданы, заказы «оплачиваются» кнопкой без реальных денег.
            </p>
          )}
          {!telegram && (
            <p className="rounded-2xl bg-teal-mist p-3 font-bold">
              Уведомления в Telegram выключены: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
            </p>
          )}
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
