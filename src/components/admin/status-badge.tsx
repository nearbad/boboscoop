import type { OrderStatus } from "@/lib/db/schema";
import { STATUS_LABELS } from "@/lib/order-status";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending_payment: "bg-lilac-soft text-ink-soft",
  paid: "bg-pink-soft text-pink-deep",
  assembling: "bg-yellow-100 text-yellow-800",
  shipped: "bg-teal-mist text-teal-deep",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status]}</span>;
}
