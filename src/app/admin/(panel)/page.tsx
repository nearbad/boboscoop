import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db/schema";
import { StatusBadge } from "@/components/admin/status-badge";
import { STATUS_LABELS } from "@/lib/orders";
import { formatRub, spoonsLabel } from "@/lib/pricing";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const [orders, counts] = await Promise.all([
    db
      .select()
      .from(schema.orders)
      .where(filter ? eq(schema.orders.status, filter) : undefined)
      .orderBy(desc(schema.orders.createdAt))
      .limit(200),
    db
      .select({ status: schema.orders.status, n: sql<number>`count(*)::int` })
      .from(schema.orders)
      .groupBy(schema.orders.status),
  ]);
  const count = (s: OrderStatus) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-black">Заказы</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin" className={`rounded-full px-3 py-1.5 text-sm font-bold ${!filter ? "bg-ink text-white" : "bg-white"}`}>
          Все
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin?status=${s}`} className={`rounded-full px-3 py-1.5 text-sm font-bold ${filter === s ? "bg-ink text-white" : "bg-white"}`}>
            {STATUS_LABELS[s]} <span className="opacity-60">{count(s)}</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center text-ink-soft">Заказов пока нет</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-3xl border-2 border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b-2 border-line text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="p-3">№</th>
                <th className="p-3">Дата</th>
                <th className="p-3">Покупатель</th>
                <th className="p-3">Боксы</th>
                <th className="p-3">Доставка</th>
                <th className="p-3 text-right">Сумма</th>
                <th className="p-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream">
                  <td className="p-3 font-black">
                    <Link href={`/admin/orders/${o.id}`} className="underline underline-offset-2">#{o.number}</Link>
                  </td>
                  <td className="p-3 text-ink-soft">{o.createdAt.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Moscow" })}</td>
                  <td className="p-3">
                    <span className="font-bold">{o.customerName}</span>
                    <span className="block text-xs text-ink-soft">{o.telegram || o.phone}</span>
                  </td>
                  <td className="p-3">{o.boxes.map((b) => `${spoonsLabel(b.spoons)}${b.video ? " 🎥" : ""}`).join(", ")}</td>
                  <td className="p-3">{o.deliveryMethod}</td>
                  <td className="p-3 text-right font-bold">{formatRub(o.total)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
