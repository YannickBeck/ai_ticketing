import { ApiError, jsonCreated, jsonOk, parseJson } from "@/server/api/http";
import { canReadOwnOrder } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import { mockNotifications } from "@/server/db/mockData";
import {
  createOrderSchema,
  notificationPreferenceSchema,
  phoneVerifyConfirmSchema,
  phoneVerifyStartSchema,
} from "@/server/domain/schemas";
import { paymentService } from "@/server/services/PaymentService";
import { reservationService } from "@/server/services/ReservationService";
import { standService } from "@/server/services/StandService";

export async function handleListStands(request: Request) {
  const stands = await standService.searchStands(new URL(request.url));
  return jsonOk(stands);
}

export async function handleGetStand(standId: string) {
  return jsonOk(await standService.getStand(standId));
}

export async function handleGetStandProducts(standId: string) {
  return jsonOk(await standService.getProductsForStand(standId));
}

export async function handleCreateOrder(request: Request) {
  const user = await requireUser(request);
  const input = createOrderSchema.parse(await parseJson(request));
  return jsonCreated(await reservationService.createReservation({ user, ...input }));
}

export async function handleCreatePaymentIntent(request: Request, orderId: string) {
  const user = await requireUser(request);
  return jsonOk(await paymentService.createPaymentIntentForOrder(orderId, user));
}

export async function handleGetOrder(request: Request, orderId: string) {
  const user = await requireUser(request);
  const order = await reservationService.getOrder(orderId);

  if (!canReadOwnOrder(user, order.customerId)) {
    throw new ApiError("FORBIDDEN", "Bestellung ist nicht im erlaubten Scope.", 403);
  }

  return jsonOk(order);
}

export async function handleGetOrderQr(request: Request, orderId: string) {
  const user = await requireUser(request);
  const order = await reservationService.getOrder(orderId);

  if (!canReadOwnOrder(user, order.customerId)) {
    throw new ApiError("FORBIDDEN", "QR-Code ist nicht im erlaubten Scope.", 403);
  }

  const qr = await reservationService.getOrderQr(orderId);

  return jsonOk(qr);
}

export async function handleCancelOrder(request: Request, orderId: string) {
  await requireUser(request);
  return jsonOk(await reservationService.cancelOrder(orderId));
}

export async function handleGetOrderNotifications(request: Request, orderId: string) {
  await requireUser(request);
  return jsonOk(mockNotifications.filter((notification) => notification.orderId === orderId));
}

export async function handleUpdateNotificationPreferences(request: Request) {
  const user = await requireUser(request);
  const input = notificationPreferenceSchema.parse(await parseJson(request));

  if (input.channel === "whatsapp" && input.enabled && !input.phoneNumber) {
    throw new ApiError("PHONE_VERIFICATION_REQUIRED", "Telefonnummer ist fuer WhatsApp erforderlich.", 422);
  }

  return jsonOk({
    userId: user.id,
    ...input,
    whatsappOptInAt: input.channel === "whatsapp" && input.enabled ? new Date().toISOString() : null,
    implementationNote: "Naechster Schritt: Preference und User-Telefonnummer persistieren.",
  });
}

export async function handlePhoneVerifyStart(request: Request) {
  await requireUser(request);
  const input = phoneVerifyStartSchema.parse(await parseJson(request));

  return jsonOk({
    phoneNumber: input.phoneNumber,
    status: "verification_started",
    implementationNote: "MVP-Skeleton: Provider-Verifikation oder Plausibilisierung anschliessen.",
  });
}

export async function handlePhoneVerifyConfirm(request: Request) {
  await requireUser(request);
  const input = phoneVerifyConfirmSchema.parse(await parseJson(request));

  return jsonOk({
    phoneNumber: input.phoneNumber,
    status: "verified",
    implementationNote: `Code ${input.code.slice(0, 2)}*** wurde im Skeleton akzeptiert.`,
  });
}
