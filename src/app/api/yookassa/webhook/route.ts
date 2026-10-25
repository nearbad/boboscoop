import { NextResponse } from "next/server";
import { getOrder, syncPayment } from "@/lib/orders";

// YooKassa notifications are not signed, so the payload is only a hint:
// syncPayment re-fetches the payment from the YooKassa API before trusting it.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = body?.object?.metadata?.orderId;
  if (typeof orderId === "string") {
    const order = await getOrder(orderId);
    if (order) {
      if (typeof body.object.id === "string" && order.paymentId !== body.object.id) {
        order.paymentId = body.object.id;
      }
      await syncPayment(order);
    }
  }
  return NextResponse.json({ ok: true });
}
