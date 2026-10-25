import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayButton } from "@/components/pay-button";
import { SiteFooter, SocialLinks } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrder, STATUS_LABELS, syncPayment } from "@/lib/orders";
import { formatRub, spoonsLabel } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { isDemoPayments } from "@/lib/yookassa";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Заказ · BoboScoop", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getOrder((await params).id);
  if (!found) notFound();
  const [order, settings] = await Promise.all([syncPayment(found), getSettings()]);
  const pending = order.status === "pending_payment";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[2.5rem] border-2 border-ink bg-white p-6 text-center shadow-pop sm:p-10">
          <Image
            src={pending ? "/bobotik/bobotik-hi.png" : "/bobotik/bobotik-boba.jpg"}
            alt=""
            width={240}
            height={240}
            className={`mx-auto h-40 w-40 object-contain ${pending ? "" : "rounded-full border-2 border-ink object-cover"}`}
          />
          <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-pink-deep">Заказ №{order.number}</p>
          <h1 className="mt-1 text-3xl font-black">
            {pending ? "Осталось оплатить" : order.status === "cancelled" ? "Заказ отменён" : "Спасибо за заказ! 💜"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            {pending
              ? "Заказ создан, но ещё не оплачен. Если вы уже оплатили, обновите страницу через минутку."
              : order.status === "cancelled"
                ? "Если это ошибка, напишите нам в Telegram."
                : "Оплата прошла. Боботик уже бежит собирать ваш бокс! Мы напишем, когда отправим заказ."}
          </p>
          <p className="mt-4 inline-block rounded-full bg-teal-mist px-4 py-1.5 font-extrabold text-teal-deep">
            {STATUS_LABELS[order.status]}
          </p>
          {pending && (
            <div className="mx-auto mt-6 max-w-xs">
              <PayButton orderId={order.id} demo={isDemoPayments()} />
            </div>
          )}
        </div>

        <section className="mt-6 rounded-blob border-2 border-line bg-white p-6">
          <h2 className="text-lg font-black">Состав заказа</h2>
          <ul className="mt-3 space-y-3">
            {order.boxes.map((b, i) => (
              <li key={i} className="flex justify-between gap-3 border-b border-line pb-3 last:border-0">
                <span>
                  <span className="font-bold">Бокс {i + 1}:</span> {spoonsLabel(b.spoons)}
                  {b.video ? " + видео" : ""}
                </span>
                <span className="font-bold">{formatRub(b.price)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3">
              <span>
                Доставка: {order.deliveryMethod}
                {order.deliveryZone ? ` (${order.deliveryZone})` : ""}
              </span>
              <span className="font-bold">{formatRub(order.deliveryPrice)}</span>
            </li>
          </ul>
          <p className="mt-4 flex justify-between border-t-2 border-dashed border-line pt-4 text-xl font-black">
            <span>Итого</span>
            <span className="text-teal-deep">{formatRub(order.total)}</span>
          </p>
        </section>

        <div className="mt-8 text-center">
          <p className="font-bold">Следите за новостями и видео с заказами:</p>
          <SocialLinks settings={settings} className="mt-3 justify-center" />
          <Link href="/" className="mt-6 inline-block text-sm font-bold text-teal-deep underline underline-offset-2">
            ← На главную
          </Link>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
