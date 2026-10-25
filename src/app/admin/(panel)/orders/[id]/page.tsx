import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrder } from "@/app/admin/actions";
import { Card, Field, Textarea } from "@/components/admin/fields";
import { ORDER_STATUSES } from "@/lib/db/schema";
import { getOrder, STATUS_LABELS, syncPayment } from "@/lib/orders";
import { formatRub, spoonsLabel } from "@/lib/pricing";
import { StatusBadge } from "@/components/admin/status-badge";
import { RarityPill } from "@/components/capsule-opener";
import { getOrderCapsules } from "@/lib/capsules";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const found = await getOrder((await params).id);
  if (!found) notFound();
  const order = await syncPayment(found);
  const capsules = await getOrderCapsules(order.id);
  const fmt = (d: Date | null) => d?.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" }) ?? "—";
  const tg = order.telegram.replace(/^@/, "");

  return (
    <div className="space-y-4">
      <Link href="/admin" className="text-sm font-bold text-ink-soft">← Все заказы</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black">Заказ #{order.number}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {order.boxes.map((b, i) => (
            <Card key={i} title={`Бокс ${i + 1}: ${spoonsLabel(b.spoons)}${b.video ? " + видео 🎥" : ""} · ${formatRub(b.price)}`}>
              <dl className="grid gap-2 text-sm sm:grid-cols-[160px_1fr]">
                <dt className="font-bold text-ink-soft">💗 Персонажи</dt>
                <dd>{b.wishes.characters.join(", ") || "—"}</dd>
                <dt className="font-bold text-ink-soft">🎨 Цвета</dt>
                <dd>{b.wishes.colors.join(", ") || "—"}</dd>
                <dt className="font-bold text-ink-soft">🚫 Не класть</dt>
                <dd>{b.wishes.exclude.join(", ") || "—"}</dd>
                <dt className="font-bold text-ink-soft">📝 Пожелания</dt>
                <dd className="whitespace-pre-line">{b.wishes.comment || "—"}</dd>
              </dl>
            </Card>
          ))}
          {order.boxes.some((b) => b.capsule) && (
            <Card title="🎰 Капсулы Боботика: положите в посылку">
              {capsules.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {capsules.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-ink-soft">Бокс {c.boxIndex + 1}:</span>
                      <span className="text-lg">{c.prizeEmoji}</span>
                      <span className="font-extrabold">{c.prizeName}</span>
                      <RarityPill rarity={c.rarity} />
                      <span className="text-xs text-ink-soft">{c.openedAt ? "покупатель открыл" : "ещё не открыта"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-soft">
                  {order.status === "pending_payment" ? "Приз разыграется после оплаты." : "Капсула не выдана: в призовом фонде ничего не осталось."}
                </p>
              )}
            </Card>
          )}
          {order.packs.length > 0 && (
            <Card title="Готовые боксы">
              <ul className="space-y-1 text-sm">
                {order.packs.map((p) => (
                  <li key={p.packId} className="flex justify-between gap-3">
                    <span>🎁 {p.title} × {p.qty}</span>
                    <span className="font-bold">{formatRub(p.price * p.qty)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card title="Покупатель и доставка">
            <dl className="grid gap-2 text-sm sm:grid-cols-[160px_1fr]">
              <dt className="font-bold text-ink-soft">ФИО</dt>
              <dd>{order.customerName}</dd>
              <dt className="font-bold text-ink-soft">Телефон</dt>
              <dd><a href={`tel:${order.phone}`} className="underline">{order.phone}</a></dd>
              <dt className="font-bold text-ink-soft">Telegram</dt>
              <dd>{tg ? <a href={`https://t.me/${tg}`} target="_blank" rel="noreferrer" className="underline">@{tg}</a> : "—"}</dd>
              <dt className="font-bold text-ink-soft">Служба</dt>
              <dd>{order.deliveryMethod}{order.deliveryZone ? ` (${order.deliveryZone})` : ""}</dd>
              <dt className="font-bold text-ink-soft">Адрес ПВЗ</dt>
              <dd className="whitespace-pre-line">{order.address}</dd>
              <dt className="font-bold text-ink-soft">Комментарий</dt>
              <dd className="whitespace-pre-line">{order.comment || "—"}</dd>
            </dl>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Оплата">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt>Товары</dt><dd className="font-bold">{formatRub(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Доставка</dt><dd className="font-bold">{formatRub(order.deliveryPrice)}</dd></div>
              <div className="flex justify-between border-t border-line pt-1 text-base"><dt className="font-black">Итого</dt><dd className="font-black">{formatRub(order.total)}</dd></div>
              <div className="flex justify-between pt-2 text-ink-soft"><dt>Создан</dt><dd>{fmt(order.createdAt)}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>Оплачен</dt><dd>{fmt(order.paidAt)}</dd></div>
              {order.paymentId && <div className="break-all pt-1 text-xs text-ink-soft">ЮKassa: {order.paymentId}</div>}
            </dl>
          </Card>
          <Card title="Статус">
            <form action={updateOrder} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-bold">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <Field label="Заметка для себя">
                <Textarea name="adminNote" defaultValue={order.adminNote} placeholder="Трек-номер, что положили…" />
              </Field>
              <button className="rounded-full bg-teal px-5 py-2 text-sm font-extrabold text-white hover:bg-teal-deep">Сохранить</button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
