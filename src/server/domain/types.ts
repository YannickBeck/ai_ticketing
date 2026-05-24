export type UserRole = "customer" | "producer_admin" | "staff" | "platform_admin";

export type StandStatus = "open" | "closed" | "seasonal_pause";

export type InventoryStatus =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "next_delivery_expected";

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "ready_for_pickup"
  | "picked_up"
  | "cancelled"
  | "expired"
  | "refunded";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type NotificationChannel = "email" | "whatsapp" | "push";

export type NotificationStatus = "pending" | "sent" | "delivered" | "failed" | "cancelled";

export type NotificationType =
  | "order_confirmed"
  | "payment_confirmed"
  | "pickup_reminder"
  | "order_ready"
  | "order_changed"
  | "picked_up"
  | "order_cancelled";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INSUFFICIENT_INVENTORY"
  | "INVALID_STATUS_TRANSITION"
  | "QR_TOKEN_ALREADY_USED"
  | "RESERVATION_EXPIRED"
  | "PAYMENT_NOT_CONFIRMED"
  | "WHATSAPP_OPT_IN_REQUIRED"
  | "PHONE_VERIFICATION_REQUIRED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type Money = {
  amountCents: number;
  currency: "EUR";
};

export type SessionUser = {
  id: string;
  role: UserRole;
  producerId?: string;
  standIds?: string[];
};

export type InventorySnapshot = {
  stockQuantity: number;
  reservedQuantity: number;
  safetyBuffer: number;
  lowStockThreshold: number;
  nextDeliveryAt?: string | null;
  manuallyOutOfStock?: boolean;
};

export type OrderEventType =
  | "order.confirmed"
  | "payment.succeeded"
  | "pickup.reminder_due"
  | "order.ready_for_pickup"
  | "order.changed"
  | "order.picked_up"
  | "order.cancelled";

export type OrderEvent = {
  type: OrderEventType;
  orderId: string;
  userId: string;
  occurredAt: Date;
};
