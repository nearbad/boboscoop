import { NextResponse } from "next/server";
import { openCapsule } from "@/lib/capsules";
import { getOrder } from "@/lib/orders";

// Reveals a capsule's prize. The prize itself was drawn when the order was paid,
// so opening (or reopening) can't change it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string; capsuleId: string }> }) {
  const { id, capsuleId } = await params;
  const order = await getOrder(id);
  if (!order || order.status === "pending_payment" || order.status === "cancelled") {
    return NextResponse.json({ error: "Капсулу можно открыть только после оплаты заказа" }, { status: 400 });
  }
  const prize = await openCapsule(order.id, Number.parseInt(capsuleId, 10) || 0);
  if (!prize) return NextResponse.json({ error: "Капсула не найдена" }, { status: 404 });
  return NextResponse.json({ prize });
}
