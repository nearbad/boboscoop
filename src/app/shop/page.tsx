import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/header";
import { PackCard } from "@/components/pack-card";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { getPacks } from "@/lib/catalog";
import { formatRub, spoonsLabel } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Каталог · BoboScoop" };

export default async function ShopPage() {
  const [settings, packs] = await Promise.all([getSettings(), getPacks()]);
  const minPrice = Math.min(...settings.tiers.map((t) => t.price));
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <SectionTitle as="h1" eyebrow="Каталог" title="Что можно заказать">
          Соберите сюрприз-бокс на ложки со своими пожеланиями или возьмите готовый набор.
        </SectionTitle>

        <Link
          href="/#builder"
          className="group grid items-center gap-6 rounded-[2.5rem] border-2 border-ink bg-pink-soft p-6 shadow-pop transition hover:-translate-y-0.5 sm:grid-cols-[180px_1fr_auto] sm:p-8"
        >
          <Image src="/bobotik/bobotik-hi.png" alt="" width={360} height={324} className="mx-auto w-40 sm:w-full" />
          <div>
            <p className="text-sm font-extrabold uppercase tracking-widest text-pink-deep">Хит</p>
            <h2 className="mt-1 text-3xl font-black">Сюрприз-бокс на ложки</h2>
            <p className="mt-2 text-ink-soft">
              {settings.tiers.map((t) => `${spoonsLabel(t.spoons)} · ${formatRub(t.price)}`).join("  ·  ")}. В среднем ~{settings.avgItems} предмета,
              любимые персонажи и цвета на ваш выбор.
            </p>
          </div>
          <span className="justify-self-start rounded-full border-2 border-ink bg-pink-deep px-6 py-3 font-black text-white shadow-pop sm:justify-self-end">
            Собрать от {formatRub(minPrice)}
          </span>
        </Link>

        <h2 className="mt-14 text-2xl font-black">Готовые боксы</h2>
        {packs.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <PackCard key={p.id} pack={p} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-blob border-2 border-dashed border-line bg-white p-8 text-center text-ink-soft">
            Готовые наборы скоро появятся. Следите за новостями в Telegram 💜
          </p>
        )}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
