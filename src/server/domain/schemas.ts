import { z } from "zod";

const openingHoursSchema = z.record(z.string(), z.string());
const standStatusSchema = z.enum(["open", "closed", "seasonal_pause"]);
const orderStatusSchema = z.enum([
  "draft",
  "pending_payment",
  "confirmed",
  "ready_for_pickup",
  "picked_up",
  "cancelled",
  "expired",
  "refunded",
]);
const notificationChannelSchema = z.enum(["email", "whatsapp", "push"]);
const notificationStatusSchema = z.enum(["pending", "sent", "delivered", "failed", "cancelled"]);
const notificationTypeSchema = z.enum([
  "order_confirmed",
  "payment_confirmed",
  "pickup_reminder",
  "order_ready",
  "order_changed",
  "picked_up",
  "order_cancelled",
]);

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive(),
});

export const createOrderSchema = z.object({
  standId: z.string().min(1),
  pickupSlotStart: z.string().datetime(),
  pickupSlotEnd: z.string().datetime(),
  items: z.array(orderItemInputSchema).min(1),
});

export const notificationPreferenceSchema = z.object({
  channel: z.enum(["email", "whatsapp", "push"]),
  enabled: z.boolean(),
  phoneNumber: z.string().min(6).optional(),
});

export const inventoryUpdateSchema = z.object({
  stockQuantity: z.number().nonnegative().optional(),
  quantityDelta: z.number().optional(),
  safetyBuffer: z.number().nonnegative().optional(),
  lowStockThreshold: z.number().nonnegative().optional(),
  nextDeliveryAt: z.string().datetime().nullable().optional(),
  note: z.string().max(500).optional(),
});

export const staffInventoryUpdateSchema = inventoryUpdateSchema.extend({
  standId: z.string().min(1),
  productId: z.string().min(1),
});

export const staffDeliverySchema = z.object({
  standId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().positive(),
  note: z.string().max(500).optional(),
});

export const staffOutOfStockSchema = z.object({
  standId: z.string().min(1),
  note: z.string().max(500).optional(),
  nextDeliveryAt: z.string().datetime().nullable().optional(),
});

export const staffScanSchema = z.object({
  standId: z.string().min(1),
  token: z.string().min(8),
});

export const pickupConfirmSchema = z.object({
  standId: z.string().min(1),
  token: z.string().min(8).optional(),
  orderNumber: z.string().min(3).optional(),
});

export const phoneVerifyStartSchema = z.object({
  phoneNumber: z.string().min(6),
});

export const phoneVerifyConfirmSchema = z.object({
  phoneNumber: z.string().min(6),
  code: z.string().min(4).max(12),
});

export const adminStandCreateSchema = z.object({
  producerId: z.string().min(1).optional(),
  name: z.string().trim().min(2),
  addressLine: z.string().trim().min(2),
  postalCode: z.string().trim().min(3),
  city: z.string().trim().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  openingHours: openingHoursSchema.default({}),
  status: standStatusSchema.default("open"),
  publicNote: z.string().max(500).nullable().optional(),
});

export const adminStandPatchSchema = adminStandCreateSchema.omit({ producerId: true }).partial();

export const adminProductCreateSchema = z.object({
  producerId: z.string().min(1).optional(),
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  unit: z.string().trim().min(1),
  priceCents: z.coerce.number().int().nonnegative(),
  currency: z.literal("EUR").default("EUR"),
  active: z.boolean().default(true),
  description: z.string().max(1000).nullable().optional(),
});

export const adminProductPatchSchema = adminProductCreateSchema.omit({ producerId: true }).partial();

export const adminOrderFiltersSchema = z.object({
  standId: z.string().min(1).optional(),
  status: orderStatusSchema.optional(),
  date: z.string().date().optional(),
});

export const adminNotificationFiltersSchema = z.object({
  orderId: z.string().min(1).optional(),
  channel: notificationChannelSchema.optional(),
  status: notificationStatusSchema.optional(),
});

export const adminNotifyOrderSchema = z.object({
  channel: z.enum(["email", "whatsapp"]).default("email"),
  type: notificationTypeSchema.default("order_changed"),
  templateKey: z.string().min(3).max(120).optional(),
});
