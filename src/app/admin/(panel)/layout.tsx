import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { isDemoPayments } from "@/lib/yookassa";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Админка · BoboScoop", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "📦 Заказы" },
  { href: "/admin/packs", label: "🎁 Готовые боксы" },
  { href: "/admin/capsule", label: "🎰 Капсула" },
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
          <AdminNav items={NAV} />
          <div className="ml-auto flex items-center gap-1">
            <Link href="/" target="_blank" className="tap px-2 text-sm font-bold text-ink-soft underline underline-offset-2">Сайт ↗</Link>
            <form action={logout}>
              <button className="min-h-11 rounded-full px-3 text-sm font-bold text-ink-soft hover:bg-pink-soft">Выйти</button>
            </form>
          </div>
        </div>
      </header>
      {(demo || !telegram) && (
        <div className="mx-auto mt-3 flex max-w-6xl flex-wrap gap-2 px-4 text-xs font-bold sm:text-sm">
          {demo && (
            <p className="rounded-full bg-pink-soft px-3 py-1.5" title="Ключи ЮKassa не заданы, заказы «оплачиваются» кнопкой без реальных денег">
              💳 Оплата в демо-режиме
            </p>
          )}
          {!telegram && (
            <p className="rounded-full bg-teal-mist px-3 py-1.5" title="Задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID">
              🔕 Уведомления в Telegram выключены
            </p>
          )}
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
