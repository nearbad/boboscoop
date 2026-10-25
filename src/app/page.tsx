import Image from "next/image";
import Link from "next/link";
import { BoxBuilder } from "@/components/box-builder";
import { RecentWins, TopPrizes } from "@/components/capsule-showcase";
import { GachaMachine } from "@/components/gacha-machine";
import { PackCard } from "@/components/pack-card";
import { ReviewWall } from "@/components/review-wall";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter, SocialLinks } from "@/components/site-footer";
import { SiteHeader } from "@/components/header";
import { capsuleSpoonsPhrase } from "@/lib/capsule";
import { getCapsuleShowcase } from "@/lib/capsules";
import { getLandingData } from "@/lib/catalog";
import { formatRub, spoonsLabel } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { settings, products, reviews, faq, delivery, packs } = await getLandingData();
  const available = products.filter((p) => p.available);
  const minPrice = Math.min(...settings.tiers.map((t) => t.price));
  const capsule = await getCapsuleShowcase(settings);
  const maxTier = Math.max(...settings.tiers.map((t) => t.spoons));

  return (
    <div>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="dotted-bg relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-10 md:grid-cols-[1.1fr_1fr] md:pb-20 md:pt-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-1.5 text-sm font-extrabold">
                <span aria-hidden>🎀</span> Sanrio · Chiikawa
              </p>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-[2.75rem] lg:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
                {settings.heroSubtitle.replace("{items}", String(settings.avgItems))}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#builder"
                  className="rounded-full border-2 border-ink bg-pink-deep px-7 py-4 text-lg font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none"
                >
                  Собрать бокс
                </a>
                <p className="font-bold text-ink-soft">
                  от <span className="text-2xl font-black text-ink">{formatRub(minPrice)}</span>
                </p>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2 text-sm font-bold">
                {settings.tiers.map((t) => (
                  <li key={t.spoons} className="rounded-full bg-white px-3 py-1.5 ring-2 ring-line">
                    {"🥄".repeat(t.spoons)} {spoonsLabel(t.spoons)} · {formatRub(t.price)}
                    {capsule.minSpoons !== null && t.spoons >= capsule.minSpoons && " + 🎁"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto w-full max-w-[220px] sm:max-w-sm md:max-w-md">
              <div className="absolute inset-6 rounded-full bg-teal-soft/60" aria-hidden />
              <Image
                src="/bobotik/bobotik-hi.png"
                alt="Боботик, серый котик-маскот BoboScoop, машет лапкой"
                width={800}
                height={720}
                priority
                className="animate-float relative drop-shadow-xl"
              />
              <span className="absolute left-2 top-6 rotate-[-8deg] rounded-2xl border-2 border-ink bg-white px-3 py-1.5 text-sm font-extrabold shadow-pop">
                привет! я Боботик 👋
              </span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionTitle eyebrow="Как это работает" title="Подарок, собранный ложечками" />
          <ol className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { icon: "🥄", title: "Выберите ложки", text: `1, 2 или ${settings.tiers.at(-1)?.spoons ?? 3} ложки сюрпризов, в среднем ~${settings.avgItems} предмета в боксе` },
              { icon: "💗", title: "Расскажите о себе", text: "Любимые персонажи, цвета и что точно не класть" },
              { icon: "💳", title: "Оплатите онлайн", text: "Бокс и доставка оплачиваются сразу, картой или по СБП" },
              { icon: "📦", title: "Получите бокс", text: "Отправим через Яндекс Маркет, Ozon или Wildberries" },
            ].map((s, i) => (
              <li key={s.title} className="relative rounded-3xl border-2 border-line bg-white p-4 sm:rounded-blob sm:p-6">
                <span className="absolute right-4 top-3 text-4xl font-black text-pink-soft sm:right-5 sm:top-4 sm:text-5xl" aria-hidden>
                  {i + 1}
                </span>
                <span className="text-3xl sm:text-4xl" aria-hidden>{s.icon}</span>
                <h3 className="mt-2 font-black leading-tight sm:mt-3 sm:text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-soft sm:text-base">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Капсула Боботика */}
        {capsule.minSpoons !== null && (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <div className="grid items-center gap-8 rounded-[2.5rem] border-2 border-ink bg-teal-mist p-6 shadow-pop sm:p-10 md:grid-cols-[280px_1fr]">
              <GachaMachine idle compact />
              <div>
                <p className="text-sm font-extrabold uppercase tracking-widest text-pink-deep">Подарок к боксу</p>
                <h2 className="mt-1 text-3xl font-black leading-tight sm:text-4xl">Капсула Боботика 🎁</h2>
                <p className="mt-3 text-lg leading-relaxed text-ink-soft">
                  К каждому боксу {capsuleSpoonsPhrase(capsule.minSpoons, maxTier)} — капсула с призом. Пустых капсул не бывает:
                  внутри может оказаться что угодно, от стикеров до супер-приза! Откроете её сразу после оплаты, а приз приедет
                  в той же посылке.
                </p>
                <div className="mt-5">
                  <TopPrizes prizes={capsule.prizes} />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <a
                    href="#builder"
                    className="rounded-full border-2 border-ink bg-pink-deep px-6 py-3 font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none"
                  >
                    Собрать бокс {capsuleSpoonsPhrase(capsule.minSpoons, maxTier)}
                  </a>
                  <Link href="/capsule" className="tap font-bold text-teal-deep underline underline-offset-2">
                    Все призы и шансы →
                  </Link>
                </div>
                {capsule.wins.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-extrabold">Недавно выпало:</p>
                    <RecentWins wins={capsule.wins.slice(0, 3)} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Builder */}
        <section id="builder" className="bg-pink-soft/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle eyebrow="Конструктор" title="Соберите свой бокс">
              Можно положить в корзину до {settings.maxBoxes} боксов, у каждого свои пожелания.
            </SectionTitle>
            <BoxBuilder
              tiers={settings.tiers}
              videoPrice={settings.videoPrice}
              videoNote={settings.videoNote}
              maxBoxes={settings.maxBoxes}
              acceptingOrders={settings.acceptingOrders}
              closedMessage={settings.closedMessage}
              capsuleMinSpoons={capsule.minSpoons}
              wishOptions={{
                characters: settings.characters,
                colors: settings.colors,
                products: available.map((p) => p.name),
                maxExclude: settings.maxExclude,
                wishesNote: settings.wishesNote,
              }}
            />
          </div>
        </section>

        {/* Ready-made packs */}
        {packs.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle eyebrow="Каталог" title="Готовые боксы">
                Наборы с фиксированной ценой: просто положите в корзину.
              </SectionTitle>
              <Link href="/shop" className="tap mb-8 font-bold text-teal-deep underline underline-offset-2">Весь каталог →</Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packs.slice(0, 3).map((p) => (
                <PackCard key={p.id} pack={p} />
              ))}
            </ul>
          </section>
        )}

        {/* Assortment teaser */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <Link
            href="/assortment"
            className="group flex flex-col gap-5 rounded-[2.5rem] border-2 border-ink bg-white p-6 shadow-pop transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-8"
          >
            <div className="flex -space-x-3" aria-hidden>
              {available.slice(0, 5).map((p) => (
                <span key={p.id} className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-lilac-soft text-2xl">
                  {p.emoji}
                </span>
              ))}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">Что может попасть в бокс?</h2>
              <p className="mt-1 text-ink-soft">
                {available.length} видов предметов: брелоки, стикеры, плюшевые игрушки, сквиши и много другого
              </p>
            </div>
            <span className="font-black text-teal-deep group-hover:underline">Смотреть ассортимент →</span>
          </Link>
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section id="reviews" className="bg-teal-mist py-16">
            <div className="mx-auto max-w-6xl px-4">
              <SectionTitle eyebrow="Отзывы" title="Что говорят бобоскупики" />
              <ReviewWall reviews={reviews.slice(0, 6)} />
              {reviews.length > 6 && (
                <p className="mt-4 text-center">
                  <Link href="/reviews" className="tap font-bold text-teal-deep underline underline-offset-2">
                    Все отзывы ({reviews.length}) →
                  </Link>
                </p>
              )}
            </div>
          </section>
        )}

        {/* About Bobotik */}
        <section id="bobotik" className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 rounded-[2.5rem] border-2 border-ink bg-white p-6 shadow-pop sm:p-10 md:grid-cols-[320px_1fr]">
            <Image
              src="/bobotik/bobotik-boba.jpg"
              alt="Боботик пьёт бабл-ти"
              width={640}
              height={640}
              className="mx-auto w-full max-w-xs rotate-[-3deg] rounded-3xl border-2 border-ink"
            />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-widest text-pink-deep">Наш маскот</p>
              <h2 className="mt-1 text-3xl font-black sm:text-4xl">{settings.aboutTitle}</h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink-soft">{settings.aboutText}</p>
              <SocialLinks settings={settings} className="mt-6" />
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="mx-auto max-w-6xl px-4">
          <div className="rounded-blob bg-lilac-soft p-6 sm:p-8">
            <h2 className="text-2xl font-black">Доставка</h2>
            <p className="mt-2 text-ink-soft">{settings.deliveryNote}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {delivery.methods.map((m) => (
                <li key={m.id} className="rounded-full bg-white px-4 py-2 font-bold">
                  {m.name} · {delivery.zones.length > 0 ? "от " : ""}{formatRub(m.price)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        {faq.length > 0 && (
          <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
            <SectionTitle eyebrow="FAQ" title="Частые вопросы" />
            <div className="space-y-3">
              {faq.map((f) => (
                <details key={f.id} className="group rounded-3xl border-2 border-line bg-white open:border-ink">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-extrabold [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-soft transition group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="whitespace-pre-line px-5 pb-5 leading-relaxed text-ink-soft">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
