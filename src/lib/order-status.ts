import type { OrderStatus } from "@/lib/db/schema";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  assembling: "Собирается",
  shipped: "Отправлен",
  completed: "Получен",
  cancelled: "Отменён",
};
