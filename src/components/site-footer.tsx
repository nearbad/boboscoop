import Link from "next/link";
import type { Settings } from "@/lib/settings";

export function SocialLinks({ settings, className = "" }: { settings: Settings; className?: string }) {
  const links = [
    { href: settings.telegramUrl, label: "Telegram", icon: "✈️" },
    { href: settings.instagramUrl, label: "Instagram", icon: "📸" },
    { href: settings.tiktokUrl, label: "TikTok", icon: "🎵" },
  ].filter((l) => l.href);
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-extrabold shadow-pop transition active:translate-y-1 active:shadow-none"
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-20 border-t-2 border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xl font-black text-teal">BoboScoop</p>
          <p className="mt-1 text-sm text-ink-soft">Сюрприз-боксы в тематике Sanrio и Chiikawa 💓</p>
          <SocialLinks settings={settings} className="mt-4" />
        </div>
        <div className="space-y-2 text-sm text-ink-soft md:text-right">
          <p>{settings.sellerInfo}</p>
          {settings.contactEmail && (
            <p>
              <a href={`mailto:${settings.contactEmail}`} className="underline underline-offset-2">
                {settings.contactEmail}
              </a>
            </p>
          )}
          <p className="flex flex-wrap gap-x-4 gap-y-1 md:justify-end">
            <Link href="/offer" className="underline underline-offset-2">Публичная оферта</Link>
            <Link href="/privacy" className="underline underline-offset-2">Политика конфиденциальности</Link>
          </p>
          <p className="text-xs">
            BoboScoop не связан с Sanrio Co., Ltd. и правообладателями Chiikawa. Товары подбираются вручную.
          </p>
        </div>
      </div>
    </footer>
  );
}
