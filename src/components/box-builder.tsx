"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { useInView } from "@/components/use-in-view";
import { WishesEditor, type WishOptions } from "@/components/wishes-editor";
import { capsuleSpoonsPhrase } from "@/lib/capsule";
import { boxPrice, boxesLabel, emptyWishes, formatRub, spoonsLabel, type Tier, type Wishes } from "@/lib/pricing";

export type BuilderProps = {
  tiers: Tier[];
  videoPrice: number;
  videoNote: string;
  maxBoxes: number;
  acceptingOrders: boolean;
  closedMessage: string;
  wishOptions: WishOptions;
  // Boxes with at least this many spoons come with a "Капсула Боботика"; null = capsules are off.
  capsuleMinSpoons: number | null;
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-blob border-2 border-line bg-white p-5 sm:p-7">
      <h3 className="mb-4 flex items-center gap-3 text-xl font-black">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-base text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function BoxBuilder(props: BuilderProps) {
  const { tiers, videoPrice, videoNote, maxBoxes, acceptingOrders, closedMessage, wishOptions, capsuleMinSpoons } = props;
  const cart = useCart();
  const [spoons, setSpoons] = useState(tiers[tiers.length - 1]?.spoons ?? 1);
  const [video, setVideo] = useState(false);
  const [wishes, setWishes] = useState<Wishes>(emptyWishes);
  const [added, setAdded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const builderOnScreen = useInView(rootRef);
  const summaryOnScreen = useInView(summaryRef);
  // The phone bar only appears while the builder is on screen and its own summary button isn't.
  const showBar = builderOnScreen && !summaryOnScreen;

  const pricing = { tiers, videoPrice, maxBoxes };
  const price = boxPrice(pricing, { spoons, video }) ?? 0;
  const single = tiers.find((t) => t.spoons === 1)?.price;
  const cartFull = cart.hydrated && cart.boxes.length >= maxBoxes;
  const withCapsule = (n: number) => capsuleMinSpoons !== null && n >= capsuleMinSpoons;
  const capsuleTier = tiers.find((t) => withCapsule(t.spoons));
  const maxTier = Math.max(...tiers.map((t) => t.spoons));

  function addToCart() {
    if (cartFull) return;
    cart.add({ spoons, video, wishes });
    setWishes(emptyWishes());
    setVideo(false);
    setAdded(true);
  }

  if (!acceptingOrders) {
    return (
      <div className="rounded-blob border-2 border-dashed border-pink bg-white p-8 text-center">
        <p className="text-4xl" aria-hidden>😿</p>
        <p className="mt-3 text-lg font-bold">{closedMessage}</p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="space-y-5">
        <Step n={1} title="Сколько ложек?">
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Количество ложек">
            {tiers.map((t) => {
              const active = t.spoons === spoons;
              const saving = single ? single * t.spoons - t.price : 0;
              return (
                <button
                  key={t.spoons}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSpoons(t.spoons)}
                  className={`relative flex items-center gap-3 rounded-3xl border-2 p-4 text-left transition sm:block ${
                    active ? "border-ink bg-pink-soft shadow-pop" : "border-line bg-cream hover:border-pink"
                  }`}
                >
                  {saving > 0 && (
                    <span className="absolute -top-3 right-3 rounded-full bg-teal px-2.5 py-0.5 text-xs font-extrabold text-white">
                      выгода {formatRub(saving)}
                    </span>
                  )}
                  <span className="w-16 shrink-0 text-xl tracking-tighter sm:block sm:w-auto sm:text-2xl" aria-hidden>
                    {"🥄".repeat(t.spoons)}
                  </span>
                  <span className="min-w-0 flex-1 sm:mt-2 sm:block">
                    <span className="block text-lg font-black">{spoonsLabel(t.spoons)}</span>
                    <span className="block text-ink-soft">{formatRub(t.price)}</span>
                  </span>
                  {withCapsule(t.spoons) && (
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-extrabold text-pink-deep ring-1 ring-pink sm:mt-2 sm:inline-block">
                      🎁 + капсула<span className="hidden sm:inline"> с призом</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {capsuleTier && capsuleMinSpoons !== null && !withCapsule(spoons) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-pink-soft p-3 text-sm font-bold">
              <span>🎁 К боксу {capsuleSpoonsPhrase(capsuleMinSpoons, maxTier)} — Капсула Боботика с призом в подарок</span>
              <button
                type="button"
                onClick={() => setSpoons(capsuleTier.spoons)}
                className="min-h-9 rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-black"
              >
                Выбрать {spoonsLabel(capsuleTier.spoons)}
              </button>
              <Link href="/capsule" className="tap text-xs text-ink-soft underline underline-offset-2">
                что это?
              </Link>
            </div>
          )}
        </Step>

        <Step n={2} title="Видео со сборкой">
          <label className="flex cursor-pointer items-start gap-4 rounded-3xl border-2 border-line bg-cream p-4 transition has-checked:border-ink has-checked:bg-teal-mist">
            <input
              type="checkbox"
              checked={video}
              onChange={(e) => setVideo(e.target.checked)}
              className="mt-1 h-6 w-6 shrink-0 accent-teal"
            />
            <span>
              <span className="block font-extrabold">🎥 Снять видео сборки вашего бокса · +{formatRub(videoPrice)}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{videoNote}</span>
            </span>
          </label>
        </Step>

        <Step n={3} title="Пожелания">
          <WishesEditor value={wishes} onChange={setWishes} options={wishOptions} idPrefix="builder" />
        </Step>
      </div>

      {/* On phones and tablets the summary sits below the long wishes step, so keep price and button in reach. */}
      <div
        inert={!showBar}
        className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t-2 border-ink bg-white px-4 py-3 transition-transform duration-300 lg:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="min-w-0">
          {added && cart.hydrated ? (
            <Link href="/cart" className="block truncate text-xs font-extrabold text-teal-deep underline underline-offset-2">
              ✓ В корзине ({cart.count}) · оформить
            </Link>
          ) : (
            <p className="truncate text-xs font-bold text-ink-soft">
              {spoonsLabel(spoons)}
              {video ? " + видео" : ""}
              {withCapsule(spoons) ? " + 🎁" : ""}
            </p>
          )}
          <p className="text-xl font-black text-teal-deep">{formatRub(price)}</p>
        </div>
        <button
          type="button"
          onClick={addToCart}
          disabled={cartFull}
          className="ml-auto shrink-0 whitespace-nowrap rounded-full border-2 border-ink bg-pink-deep px-5 py-2.5 font-black text-white shadow-pop active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          {cartFull ? "Корзина полна" : added ? "+ ещё бокс" : "В корзину"}
        </button>
      </div>

      <aside ref={summaryRef} className="rounded-blob border-2 border-ink bg-white p-6 shadow-pop lg:sticky lg:top-24">
        <h3 className="text-lg font-black">Ваш бокс</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">{spoonsLabel(spoons)}</dt>
            <dd className="font-bold">{formatRub(boxPrice(pricing, { spoons, video: false }) ?? 0)}</dd>
          </div>
          {video && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Видео</dt>
              <dd className="font-bold">+{formatRub(videoPrice)}</dd>
            </div>
          )}
          {withCapsule(spoons) && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">🎁 Капсула Боботика</dt>
              <dd className="font-bold text-pink-deep">в подарок</dd>
            </div>
          )}
          {wishes.characters.length + wishes.colors.length + wishes.exclude.length > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Пожелания</dt>
              <dd className="text-right font-bold">
                {wishes.characters.length + wishes.colors.length + wishes.exclude.length} отмечено
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t-2 border-dashed border-line pt-4">
          <span className="font-bold">Итого</span>
          <span className="text-3xl font-black text-teal-deep">{formatRub(price)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">Доставка рассчитывается в корзине</p>

        <button
          type="button"
          onClick={addToCart}
          disabled={cartFull}
          className="mt-5 w-full rounded-full border-2 border-ink bg-pink-deep px-6 py-3.5 text-lg font-black text-white shadow-pop transition hover:bg-pink-deep/90 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Добавить в корзину
        </button>
        {cartFull && (
          <p className="mt-3 text-center text-sm text-ink-soft">
            В заказе может быть не больше {boxesLabel(maxBoxes)}
          </p>
        )}
        {added && !cartFull && (
          <p className="mt-3 text-center text-sm font-bold text-teal-deep" role="status">
            Бокс в корзине! 🎉 Можно собрать ещё один или{" "}
            <Link href="/cart" className="underline underline-offset-2">
              оформить заказ
            </Link>
          </p>
        )}
        {added && cartFull && (
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm font-bold text-teal-deep underline underline-offset-2"
          >
            Перейти к оформлению →
          </Link>
        )}
      </aside>
    </div>
  );
}
