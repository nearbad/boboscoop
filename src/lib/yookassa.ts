import "server-only";

const API = "https://api.yookassa.ru/v3";

export type YooPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
};

// Without keys the shop runs in demo mode: payment is simulated and always succeeds.
export function isDemoPayments(): boolean {
  return !process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY;
}

function authHeader() {
  const raw = `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

type ReceiptItem = { description: string; quantity: string; amount: { value: string; currency: "RUB" }; vat_code: number; payment_mode: "full_payment"; payment_subject: "commodity" | "service" };

export async function createPayment(opts: {
  idempotenceKey: string;
  orderId: string;
  amount: number;
  description: string;
  returnUrl: string;
  receipt?: { phone: string; items: { description: string; amount: number; subject: "commodity" | "service" }[] };
}): Promise<YooPayment> {
  const body: Record<string, unknown> = {
    amount: { value: opts.amount.toFixed(2), currency: "RUB" },
    capture: true,
    confirmation: { type: "redirect", return_url: opts.returnUrl },
    description: opts.description.slice(0, 128),
    metadata: { orderId: opts.orderId },
  };
  if (opts.receipt && process.env.YOOKASSA_SEND_RECEIPT === "true") {
    body.receipt = {
      customer: { phone: opts.receipt.phone },
      items: opts.receipt.items.map<ReceiptItem>((i) => ({
        description: i.description.slice(0, 128),
        quantity: "1",
        amount: { value: i.amount.toFixed(2), currency: "RUB" },
        vat_code: 1,
        payment_mode: "full_payment",
        payment_subject: i.subject,
      })),
    };
  }
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Idempotence-Key": opts.idempotenceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`YooKassa create payment failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getPayment(id: string): Promise<YooPayment> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`YooKassa get payment failed: ${res.status} ${await res.text()}`);
  return res.json();
}
