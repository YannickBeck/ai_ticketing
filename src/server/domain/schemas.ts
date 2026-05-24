import { z } from "zod";

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
