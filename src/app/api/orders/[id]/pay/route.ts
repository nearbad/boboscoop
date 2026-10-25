import { NextResponse } from "next/server";
import { getOrder, startPayment } from "@/lib/orders";

// Restarts payment for an order that is still unpaid (e.g. the customer closed the payment page).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const order = await getOrder((await params).id);
  if (!order || order.status !== "pending_payment") {
    return NextResponse.json({ error: "Заказ не найден или уже оплачен" }, { status: 400 });
  }
  try {
    return NextResponse.json({ redirectUrl: await startPayment(order) });
  } catch (err) {
    console.error("[pay]", err);
    return NextResponse.json({ error: "Не получилось перейти к оплате, попробуйте позже" }, { status: 500 });
  }
}
