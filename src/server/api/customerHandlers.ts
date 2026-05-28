import { ApiError, jsonCreated, jsonOk, parseJson } from "@/server/api/http";
import { canReadOwnOrder } from "@/server/auth/permissions";
import { requireUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";
import { NotificationChannel } from "@prisma/client";
import {
  createOrderSchema,
  notificationPreferenceSchema,
  phoneVerifyConfirmSchema,
  phoneVerifyStartSchema,
} from "@/server/domain/schemas";
import { paymentService } from "@/server/services/PaymentService";
import { reservationService } from "@/server/services/ReservationService";
import { standService } from "@/server/services/StandService";

const channelMap: Record<string, NotificationChannel> = {
  email: NotificationChannel.EMAIL,
  whatsapp: NotificationChannel.WHATSAPP,
  push: NotificationChannel.PUSH,
};

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
  const user = await requireUser(request);
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { customerId: true } });
  if (!order) throw new ApiError("NOT_FOUND", "Bestellung nicht gefunden.", 404);
  if (!canReadOwnOrder(user, order.customerId)) {
    throw new ApiError("FORBIDDEN", "Benachrichtigungen sind nicht im erlaubten Scope.", 403);
  }
  const notifications = await prisma.notification.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk(notifications);
}

export async function handleGetNotificationPreferences(request: Request) {
  const user = await requireUser(request);

  const [dbUser, preferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { phoneNumber: true, whatsappOptIn: true, whatsappOptInAt: true },
    }),
    prisma.notificationPreference.findMany({
      where: { userId: user.id },
      select: { channel: true, enabled: true, updatedAt: true },
    }),
  ]);

  return jsonOk({
    phoneNumber: dbUser?.phoneNumber ?? null,
    whatsappOptIn: dbUser?.whatsappOptIn ?? false,
    whatsappOptInAt: dbUser?.whatsappOptInAt?.toISOString() ?? null,
    preferences,
  });
}

export async function handleUpdateNotificationPreferences(request: Request) {
  const user = await requireUser(request);
  const input = notificationPreferenceSchema.parse(await parseJson(request));

  if (input.channel === "whatsapp" && input.enabled && !input.phoneNumber) {
    throw new ApiError("PHONE_VERIFICATION_REQUIRED", "Telefonnummer ist fuer WhatsApp erforderlich.", 422);
  }

  const prismaChannel = channelMap[input.channel];

  // Persist phone number and WhatsApp opt-in on the User record
  const userUpdate: Parameters<typeof prisma.user.update>[0]["data"] = {};
  if (input.channel === "whatsapp") {
    if (input.phoneNumber) userUpdate.phoneNumber = input.phoneNumber;
    userUpdate.whatsappOptIn = input.enabled;
    userUpdate.whatsappOptInAt = input.enabled ? new Date() : undefined;
    userUpdate.whatsappOptOutAt = !input.enabled ? new Date() : undefined;
  }

  await prisma.$transaction([
    ...(Object.keys(userUpdate).length > 0
      ? [prisma.user.update({ where: { id: user.id }, data: userUpdate })]
      : []),
    prisma.notificationPreference.upsert({
      where: { userId_channel: { userId: user.id, channel: prismaChannel } },
      create: { userId: user.id, channel: prismaChannel, enabled: input.enabled },
      update: { enabled: input.enabled },
    }),
  ]);

  return jsonOk({
    userId: user.id,
    channel: input.channel,
    enabled: input.enabled,
    phoneNumber: input.phoneNumber ?? null,
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
