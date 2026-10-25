import { NextResponse } from "next/server";
import { getOrder, markPaid } from "@/lib/orders";
import { isDemoPayments } from "@/lib/yookassa";

// Simulated payment, available only while YooKassa keys are not configured.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isDemoPayments()) return NextResponse.json({ error: "Демо-оплата выключена" }, { status: 403 });
  const order = await getOrder((await params).id);
  if (!order) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  await markPaid(order.id, null);
  return NextResponse.json({ ok: true });
}
