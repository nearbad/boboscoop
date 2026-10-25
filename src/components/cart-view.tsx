"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useCart, type CartBox } from "@/components/cart-context";
import { useInView } from "@/components/use-in-view";
import { WishesEditor, type WishOptions } from "@/components/wishes-editor";
import { capsulesLabel } from "@/lib/capsule";
import { boxPrice, boxesLabel, cartSubtotal, formatRub, spoonsLabel, type PricingSettings } from "@/lib/pricing";

type Method = { id: number; name: string; price: number; note: string };
type Zone = { id: number; name: string; extra: number };
export type PackInfo = { id: number; slug: string; title: string; price: number; image: string | null; limit: number };

function PackLine({ packId, qty, pack }: { packId: number; qty: number; pack: PackInfo | undefined }) {
  const { setPackQty } = useCart();
  if (!pack) {
    return (
      <li className="flex items-center justify-between gap-3 rounded-blob border-2 border-dashed border-line bg-white p-5">
        <span className="font-bold text-ink-soft">Этот готовый бокс больше недоступен</span>
        <button type="button" onClick={() => setPackQty(packId, 0)} className="rounded-full px-3 py-2 text-sm font-bold hover:bg-pink-soft">
          Убрать
        </button>
      </li>
    );
  }
  const over = qty > pack.limit;
  return (
    <li className="grid grid-cols-[80px_1fr] items-center gap-x-4 gap-y-3 rounded-blob border-2 border-line bg-white p-4 sm:grid-cols-[80px_1fr_auto]">
      <Link href={`/shop/${pack.slug}`} className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-pink-soft text-3xl">
        {pack.image ? <Image src={pack.image} alt="" fill sizes="80px" className="object-cover" /> : <span aria-hidden>🎁</span>}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-pink-deep">Готовый бокс</p>
        <Link href={`/shop/${pack.slug}`} className="inline-block py-1 text-lg font-black leading-tight hover:underline">{pack.title}</Link>
        <p className="text-sm text-ink-soft">{formatRub(pack.price)} за шт.</p>
        {over && <p className="text-sm font-bold text-pink-deep">{pack.limit > 0 ? `Можно не больше ${pack.limit} шт.` : "Закончился"}</p>}
      </div>
      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
        <div className="flex items-center rounded-full border-2 border-line">
          <button type="button" onClick={() => setPackQty(packId, qty - 1)} className="h-11 w-11 text-lg font-black" aria-label="Убрать один">−</button>
          <span className="min-w-6 text-center font-black">{qty}</span>
          <button type="button" onClick={() => setPackQty(packId, qty + 1)} disabled={qty >= pack.limit} className="h-11 w-11 text-lg font-black disabled:opacity-30" aria-label="Добавить один">+</button>
        </div>
        <span className="w-24 text-right text-lg font-black">{formatRub(pack.price * qty)}</span>
      </div>
    </li>
  );
}

const input =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 placeholder:text-ink-soft/60 focus:border-teal focus:outline-none";

function BoxCard({
  box,
  index,
  pricing,
  wishOptions,
  capsuleMinSpoons,
}: {
  box: CartBox;
  index: number;
  pricing: PricingSettings;
  wishOptions: WishOptions;
  capsuleMinSpoons: number | null;
}) {
  const { update, remove } = useCart();
  const [editing, setEditing] = useState(false);
  const price = boxPrice(pricing, box);
  const w = box.wishes;
  const summary = [
    w.characters.length ? `💗 ${w.characters.join(", ")}` : "",
    w.colors.length ? `🎨 ${w.colors.join(", ")}` : "",
    w.exclude.length ? `🚫 без: ${w.exclude.join(", ")}` : "",
    w.comment ? `📝 ${w.comment}` : "",
  ].filter(Boolean);

  return (
    <li className="rounded-blob border-2 border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-pink-deep">Бокс {index + 1}</p>
          <p className="text-lg font-black">
            {"🥄".repeat(box.spoons)} {spoonsLabel(box.spoons)}
            {box.video && " + видео 🎥"}
          </p>
        </div>
        <p className="shrink-0 text-xl font-black">{price === null ? "—" : formatRub(price)}</p>
      </div>
      {price === null && (
        <p className="mt-2 text-sm font-bold text-pink-deep">Такого варианта больше нет, выберите количество ложек заново</p>
      )}
      {capsuleMinSpoons !== null &&
        (box.spoons >= capsuleMinSpoons ? (
          <p className="mt-2 inline-block rounded-full bg-pink-soft px-3 py-1 text-xs font-extrabold text-pink-deep">🎁 + Капсула Боботика с призом</p>
        ) : (
          <p className="mt-2 text-xs font-bold text-ink-soft">
            🎁 Выберите {spoonsLabel(capsuleMinSpoons)}, чтобы получить Капсулу Боботика с призом
          </p>
        ))}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`spoons-${box.id}`}>Количество ложек</label>
        <select
          id={`spoons-${box.id}`}
          value={box.spoons}
          onChange={(e) => update(box.id, { spoons: Number(e.target.value) })}
          className="min-h-11 rounded-full border-2 border-line bg-cream px-3 text-base font-bold sm:min-h-10"
        >
          {price === null && <option value={box.spoons}>—</option>}
          {pricing.tiers.map((t) => (
            <option key={t.spoons} value={t.spoons}>
              {spoonsLabel(t.spoons)} · {formatRub(t.price)}
            </option>
          ))}
        </select>
        <label className="flex min-h-11 cursor-pointer items-center sm:min-h-10 gap-2 rounded-full border-2 border-line bg-cream px-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={box.video}
            onChange={(e) => update(box.id, { video: e.target.checked })}
            className="h-4 w-4 accent-teal"
          />
          Видео +{formatRub(pricing.videoPrice)}
        </label>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
          className="min-h-11 rounded-full border-2 border-line px-3 text-sm font-bold hover:border-pink sm:min-h-10"
        >
          {editing ? "Готово" : "Изменить пожелания"}
        </button>
        <button
          type="button"
          onClick={() => remove(box.id)}
          className="ml-auto min-h-11 rounded-full px-3 sm:min-h-10 text-sm font-bold text-ink-soft hover:bg-pink-soft hover:text-ink"
        >
          Удалить
        </button>
      </div>

      {editing ? (
        <div className="mt-5 border-t-2 border-dashed border-line pt-5">
          <WishesEditor value={box.wishes} onChange={(wishes) => update(box.id, { wishes })} options={wishOptions} idPrefix={box.id} />
        </div>
      ) : summary.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-ink-soft">
          {summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">Без пожеланий: полностью доверяетесь Боботику 🐾</p>
      )}
    </li>
  );
}

export function CartView({
  pricing,
  acceptingOrders,
  closedMessage,
  methods,
  zones,
  packs,
  wishOptions,
  capsuleMinSpoons,
}: {
  capsuleMinSpoons: number | null;
  packs: PackInfo[];
  pricing: PricingSettings;
  acceptingOrders: boolean;
  closedMessage: string;
  methods: Method[];
  zones: Zone[];
  wishOptions: WishOptions;
}) {
  const cart = useCart();
  const [methodId, setMethodId] = useState<number | null>(methods[0]?.id ?? null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", telegram: "", address: "", comment: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const summaryOnScreen = useInView(summaryRef);

  if (!cart.hydrated) return <p className="mt-8 text-ink-soft">Загружаем корзину…</p>;

  if (cart.count === 0) {
    return (
      <div className="mt-8 rounded-blob border-2 border-dashed border-pink bg-white p-10 text-center">
        <p className="text-5xl" aria-hidden>🧺</p>
        <p className="mt-4 text-xl font-black">Пока пусто</p>
        <p className="mt-1 text-ink-soft">Боботик ждёт, когда вы соберёте свой первый бокс</p>
        <Link
          href="/#builder"
          className="mt-6 inline-block rounded-full border-2 border-ink bg-pink-deep px-6 py-3 font-black text-white shadow-pop active:translate-y-1 active:shadow-none"
        >
          Собрать бокс
        </Link>
      </div>
    );
  }

  const method = methods.find((m) => m.id === methodId);
  const zone = zones.find((z) => z.id === zoneId);
  const packLines = cart.packs.map((l) => ({ ...l, pack: packs.find((p) => p.id === l.packId) }));
  const subtotal = cartSubtotal(pricing, cart.boxes) + packLines.reduce((s, l) => s + (l.pack?.price ?? 0) * l.qty, 0);
  const invalidPack = packLines.some((l) => !l.pack || l.qty > l.pack.limit);
  const capsuleCount = capsuleMinSpoons === null ? 0 : cart.boxes.filter((b) => b.spoons >= capsuleMinSpoons).length;
  const delivery = method ? method.price + (zone?.extra ?? 0) : 0;
  const overLimit = cart.boxes.length > pricing.maxBoxes;
  const invalidBox = cart.boxes.some((b) => boxPrice(pricing, b) === null);
  const blocked = submitting || overLimit || invalidBox || invalidPack || !acceptingOrders;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!method) return setError("Выберите способ доставки");
    if (zones.length > 0 && !zone) return setError("Выберите регион доставки");
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxes: cart.boxes.map(({ spoons, video, wishes }) => ({ spoons, video, wishes })),
          packs: cart.packs.map(({ packId, qty }) => ({ packId, qty })),
          ...form,
          deliveryMethodId: method.id,
          deliveryZoneId: zone?.id ?? null,
          consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Что-то пошло не так");
      cart.clear();
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-6 pb-24 lg:grid-cols-[1fr_380px] lg:items-start lg:pb-0">
      <div className="space-y-6">
        {packLines.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-black">Готовые боксы</h2>
              <Link href="/shop" className="tap text-sm font-bold text-teal-deep underline underline-offset-2">каталог</Link>
            </div>
            <ul className="space-y-3">
              {packLines.map((l) => (
                <PackLine key={l.packId} packId={l.packId} qty={l.qty} pack={l.pack} />
              ))}
            </ul>
          </section>
        )}

        {cart.boxes.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-black">
                {boxesLabel(cart.boxes.length)} <span className="text-base font-bold text-ink-soft">из {pricing.maxBoxes} возможных</span>
              </h2>
              {cart.boxes.length < pricing.maxBoxes && (
                <Link href="/#builder" className="tap text-sm font-bold text-teal-deep underline underline-offset-2">
                  + ещё бокс
                </Link>
              )}
            </div>
            <ul className="space-y-4">
              {cart.boxes.map((b, i) => (
                <BoxCard key={b.id} box={b} index={i} pricing={pricing} wishOptions={wishOptions} capsuleMinSpoons={capsuleMinSpoons} />
              ))}
            </ul>
            {overLimit && (
              <p className="mt-3 font-bold text-pink-deep">
                В одном заказе можно не больше {boxesLabel(pricing.maxBoxes)}, удалите лишние
              </p>
            )}
          </section>
        )}

        <section className="rounded-blob border-2 border-line bg-white p-5 sm:p-7">
          <h2 className="mb-4 text-xl font-black">Доставка</h2>
          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Служба доставки</legend>
            {methods.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl border-2 border-line bg-cream px-4 py-3 transition has-checked:border-ink has-checked:bg-teal-mist sm:block sm:p-4"
              >
                <input
                  type="radio"
                  name="method"
                  className="sr-only"
                  checked={methodId === m.id}
                  onChange={() => setMethodId(m.id)}
                />
                <span className="block font-black">{m.name}</span>
                <span className="block text-sm text-ink-soft">{formatRub(m.price)}</span>
              </label>
            ))}
          </fieldset>
          {method?.note && <p className="mt-3 text-sm text-ink-soft">{method.note}</p>}

          {zones.length > 0 && (
            <div className="mt-4">
              <label htmlFor="zone" className="mb-1 block font-extrabold">Регион</label>
              <select
                id="zone"
                value={zoneId ?? ""}
                onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : null)}
                className={input}
                required
              >
                <option value="">Выберите регион</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}{z.extra > 0 ? ` · +${formatRub(z.extra)}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4">
            <label htmlFor="address" className="mb-1 block font-extrabold">Адрес пункта выдачи</label>
            <textarea
              id="address"
              required
              rows={2}
              value={form.address}
              onChange={set("address")}
              placeholder="Город, улица, дом пункта выдачи"
              className={input}
            />
          </div>
        </section>

        <section className="rounded-blob border-2 border-line bg-white p-5 sm:p-7">
          <h2 className="mb-4 text-xl font-black">Получатель</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-1 block font-extrabold">ФИО</label>
              <input id="name" required autoComplete="name" value={form.name} onChange={set("name")} className={input} placeholder="Как в паспорте, для пункта выдачи" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block font-extrabold">Телефон</label>
              <input id="phone" required type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} className={input} placeholder="+7 900 000-00-00" />
            </div>
            <div>
              <label htmlFor="telegram" className="mb-1 block font-extrabold">
                Ник в Telegram <span className="font-bold text-ink-soft">(для связи)</span>
              </label>
              <input id="telegram" value={form.telegram} onChange={set("telegram")} className={input} placeholder="@bobofan" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="comment" className="mb-1 block font-extrabold">
                Комментарий к заказу <span className="font-bold text-ink-soft">(необязательно)</span>
              </label>
              <textarea id="comment" rows={2} value={form.comment} onChange={set("comment")} className={input} />
            </div>
          </div>
        </section>
      </div>

      <aside ref={summaryRef} className="rounded-blob border-2 border-ink bg-white p-6 shadow-pop lg:sticky lg:top-24">
        <h2 className="text-lg font-black">Ваш заказ</h2>
        <dl className="mt-4 space-y-2 text-sm">
          {cart.boxes.map((b, i) => (
            <div key={b.id} className="flex justify-between gap-3">
              <dt className="text-ink-soft">
                Бокс {i + 1}: {spoonsLabel(b.spoons)}
                {b.video ? " + видео" : ""}
              </dt>
              <dd className="font-bold">{formatRub(boxPrice(pricing, b) ?? 0)}</dd>
            </div>
          ))}
          {packLines.map((l) =>
            l.pack ? (
              <div key={l.packId} className="flex justify-between gap-3">
                <dt className="text-ink-soft">
                  {l.pack.title} × {l.qty}
                </dt>
                <dd className="font-bold">{formatRub(l.pack.price * l.qty)}</dd>
              </div>
            ) : null,
          )}
          {capsuleCount > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">🎁 {capsulesLabel(capsuleCount)} Боботика</dt>
              <dd className="font-bold text-pink-deep">в подарок</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-ink-soft">Доставка{method ? `, ${method.name}` : ""}</dt>
            <dd className="font-bold">{zones.length > 0 && !zone ? "выберите регион" : formatRub(delivery)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t-2 border-dashed border-line pt-4">
          <span className="font-bold">К оплате</span>
          <span className="text-3xl font-black text-teal-deep">{formatRub(subtotal + delivery)}</span>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-teal" />
          <span>
            Согласен(на) с{" "}
            <Link href="/offer" target="_blank" className="underline underline-offset-2">офертой</Link> и даю согласие на обработку
            персональных данных по{" "}
            <Link href="/privacy" target="_blank" className="underline underline-offset-2">политике конфиденциальности</Link>
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-2xl bg-pink-soft p-3 text-sm font-bold text-ink" role="alert">
            {error}
          </p>
        )}
        {!acceptingOrders && <p className="mt-4 rounded-2xl bg-lilac-soft p-3 text-sm font-bold">{closedMessage}</p>}

        <button
          type="submit"
          disabled={blocked}
          className="mt-5 w-full rounded-full border-2 border-ink bg-pink-deep px-6 py-3.5 text-lg font-black text-white shadow-pop transition active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Создаём заказ…" : "Перейти к оплате"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-soft">Оплата картой или по СБП через ЮKassa</p>
      </aside>

      {/* On phones and tablets the summary is at the very bottom: keep the total and the pay button in reach.
          Submitting from here lets the browser jump to the first empty required field. */}
      <div
        inert={summaryOnScreen}
        className={`fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-white px-4 py-3 transition-transform duration-300 lg:hidden ${
          summaryOnScreen ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div>
            <p className="text-xs font-bold text-ink-soft">К оплате{capsuleCount > 0 ? ` · 🎁 ×${capsuleCount}` : ""}</p>
            <p className="text-xl font-black text-teal-deep">{formatRub(subtotal + delivery)}</p>
          </div>
          <button
            type="submit"
            disabled={blocked}
            className="ml-auto rounded-full border-2 border-ink bg-pink-deep px-5 py-2.5 font-black text-white shadow-pop active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {submitting ? "Создаём…" : "Оформить"}
          </button>
        </div>
        {error && <p className="mx-auto mt-1 max-w-2xl text-xs font-bold text-pink-deep">{error}</p>}
      </div>
    </form>
  );
}
