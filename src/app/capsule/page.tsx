import type { Metadata } from "next";
import Link from "next/link";
import { PrizeOdds, RecentWins } from "@/components/capsule-showcase";
import { GachaMachine } from "@/components/gacha-machine";
import { SiteHeader } from "@/components/header";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { capsuleSpoonsPhrase } from "@/lib/capsule";
import { getCapsuleShowcase } from "@/lib/capsules";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Капсула Боботика · BoboScoop",
  description: "Подарок к боксу: капсула с призом, пустых капсул не бывает. Все призы и шансы.",
};

export default async function CapsulePage() {
  const settings = await getSettings();
  const capsule = await getCapsuleShowcase(settings);
  const maxTier = Math.max(...settings.tiers.map((t) => t.spoons));

  if (capsule.minSpoons === null) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-black">Капсула Боботика отдыхает 😴</h1>
          <p className="mt-3 text-ink-soft">Сейчас капсулы не выдаются. Следите за новостями в Telegram!</p>
          <Link href="/" className="mt-6 inline-block font-bold text-teal-deep underline underline-offset-2">← На главную</Link>
        </main>
        <SiteFooter settings={settings} />
      </>
    );
  }

  const phrase = capsuleSpoonsPhrase(capsule.minSpoons, maxTier);
  const steps = [
    { icon: "🥄", title: `Соберите бокс ${phrase}`, text: "Капсула прилагается к каждому такому боксу, даже если их несколько в заказе" },
    { icon: "💳", title: "Оплатите заказ", text: "В момент оплаты Боботик выбирает приз для каждой капсулы" },
    { icon: "🎰", title: "Крутите ручку", text: "На странице заказа откройте капсулу и узнайте, что выпало" },
    { icon: "📦", title: "Получите приз", text: "Положим его в ту же посылку, что и бокс" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid items-center gap-10 md:grid-cols-[300px_1fr]">
          <GachaMachine idle compact />
          <div>
            <SectionTitle as="h1" eyebrow="Подарок к боксу" title="Капсула Боботика">
              К каждому боксу {phrase} — капсула с призом. Пустых капсул не бывает!
            </SectionTitle>
            <ol className="grid gap-3 sm:grid-cols-2">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-3xl border-2 border-line bg-white p-4">
                  <p className="flex items-center gap-2 font-black">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal text-sm text-white">{i + 1}</span>
                    {s.icon} {s.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-black">Призы и шансы</h2>
          <p className="mt-1 text-ink-soft">Шанс показывает, как часто выпадает приз. Когда приз заканчивается, шансы остальных пересчитываются.</p>
          <div className="mt-5">
            <PrizeOdds prizes={capsule.prizes} totalWeight={capsule.totalWeight} />
          </div>
        </section>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <section className="rounded-blob border-2 border-line bg-white p-6">
            <h2 className="text-xl font-black">Правила</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{settings.capsuleRules.replaceAll("{spoons}", phrase)}</p>
          </section>
          <section className="rounded-blob bg-lilac-soft p-6">
            <h2 className="text-xl font-black">Недавно выпало</h2>
            <div className="mt-3">
              {capsule.wins.length > 0 ? (
                <RecentWins wins={capsule.wins} />
              ) : (
                <p className="text-ink-soft">Здесь появятся призы первых счастливчиков 🍀</p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#builder"
            className="inline-block rounded-full border-2 border-ink bg-pink-deep px-7 py-4 text-lg font-black text-white shadow-pop active:translate-y-1 active:shadow-none"
          >
            Собрать бокс {phrase}
          </Link>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
