import { NextResponse } from "next/server";
import { checkoutSchema, CheckoutError, createOrder, startPayment } from "@/lib/orders";

export async function POST(req: Request) {
  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте данные заказа" }, { status: 400 });
  }
  try {
    const order = await createOrder(parsed.data);
    const redirectUrl = await startPayment(order);
    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[orders]", err);
    return NextResponse.json({ error: "Не получилось создать заказ, попробуйте ещё раз" }, { status: 500 });
  }
}
