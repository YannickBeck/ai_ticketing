import {
  InventoryStatus,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  OrderStatus,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { prisma } from "@/server/db/prisma";
import type {
  NotificationChannel as DomainNotificationChannel,
  NotificationStatus as DomainNotificationStatus,
  NotificationType as DomainNotificationType,
  OrderStatus as DomainOrderStatus,
  SessionUser,
} from "@/server/domain/types";

type AdminOrderFilters = {
  standId?: string;
  status?: DomainOrderStatus;
  date?: string;
};

type AdminNotificationFilters = {
  orderId?: string;
  channel?: DomainNotificationChannel;
  status?: DomainNotificationStatus;
};

type QueueOrderNotificationInput = {
  channel: "email" | "whatsapp";
  type: DomainNotificationType;
  templateKey?: string;
};

const orderStatusMap: Record<OrderStatus, DomainOrderStatus> = {
  [OrderStatus.DRAFT]: "draft",
  [OrderStatus.PENDING_PAYMENT]: "pending_payment",
  [OrderStatus.CONFIRMED]: "confirmed",
  [OrderStatus.READY_FOR_PICKUP]: "ready_for_pickup",
  [OrderStatus.PICKED_UP]: "picked_up",
  [OrderStatus.CANCELLED]: "cancelled",
  [OrderStatus.EXPIRED]: "expired",
  [OrderStatus.REFUNDED]: "refunded",
};

const notificationStatusMap: Record<NotificationStatus, DomainNotificationStatus> = {
  [NotificationStatus.PENDING]: "pending",
  [NotificationStatus.SENT]: "sent",
  [NotificationStatus.DELIVERED]: "delivered",
  [NotificationStatus.FAILED]: "failed",
  [NotificationStatus.CANCELLED]: "cancelled",
};

const notificationChannelMap: Record<NotificationChannel, DomainNotificationChannel> = {
  [NotificationChannel.EMAIL]: "email",
  [NotificationChannel.WHATSAPP]: "whatsapp",
  [NotificationChannel.PUSH]: "push",
};

const notificationTypeMap: Record<NotificationType, DomainNotificationType> = {
  [NotificationType.ORDER_CONFIRMED]: "order_confirmed",
  [NotificationType.PAYMENT_CONFIRMED]: "payment_confirmed",
  [NotificationType.PICKUP_REMINDER]: "pickup_reminder",
  [NotificationType.ORDER_READY]: "order_ready",
  [NotificationType.ORDER_CHANGED]: "order_changed",
  [NotificationType.PICKED_UP]: "picked_up",
  [NotificationType.ORDER_CANCELLED]: "order_cancelled",
};

export class AdminQueryService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getDashboard(user: SessionUser) {
    const orderWhere = this.orderScopeWhere(user);
    const today = this.todayRange();

    const [reservationsToday, openPickups, criticalInventory, failedNotifications] = await Promise.all([
      this.db.order.count({
        where: {
          ...orderWhere,
          createdAt: {
            gte: today.start,
            lt: today.end,
          },
        },
      }),
      this.db.order.count({
        where: {
          ...orderWhere,
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP],
          },
        },
      }),
      this.db.inventory.count({
        where: {
          status: {
            in: [InventoryStatus.LOW_STOCK, InventoryStatus.OUT_OF_STOCK, InventoryStatus.NEXT_DELIVERY_EXPECTED],
          },
          stand: this.standScopeWhere(user),
        },
      }),
      this.db.notification.count({
        where: {
          ...this.notificationScopeWhere(user),
          status: NotificationStatus.FAILED,
        },
      }),
    ]);

    return {
      reservationsToday,
      openPickups,
      criticalInventory,
      failedNotifications,
      scope: user.producerId ?? "platform",
    };
  }

  async listOrders(user: SessionUser, filters: AdminOrderFilters = {}) {
    const orders = await this.db.order.findMany({
      where: {
        ...this.orderScopeWhere(user),
        ...(filters.standId ? { standId: filters.standId } : {}),
        ...(filters.status ? { status: this.toPrismaOrderStatus(filters.status) } : {}),
        ...(filters.date ? { pickupSlotStart: this.dateFilter(filters.date) } : {}),
      },
      include: {
        stand: true,
        customer: true,
        payment: true,
        items: { include: { product: true } },
      },
      orderBy: { pickupSlotStart: "desc" },
    });

    return orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customer.name,
      producerId: order.producerId,
      standId: order.standId,
      standName: order.stand.name,
      status: orderStatusMap[order.status],
      pickupSlotStart: order.pickupSlotStart.toISOString(),
      pickupSlotEnd: order.pickupSlotEnd.toISOString(),
      productTotalCents: order.productTotalCents,
      serviceFeeCents: order.serviceFeeCents,
      totalAmountCents: order.totalAmountCents,
      currency: order.currency as "EUR",
      paymentStatus: order.payment?.status ? order.payment.status.toLowerCase() : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalPriceCents: item.totalPriceCents,
      })),
    }));
  }

  async listNotifications(user: SessionUser, filters: AdminNotificationFilters = {}) {
    const notifications = await this.db.notification.findMany({
      where: {
        ...this.notificationScopeWhere(user),
        ...(filters.orderId ? { orderId: filters.orderId } : {}),
        ...(filters.channel ? { channel: this.toPrismaNotificationChannel(filters.channel) } : {}),
        ...(filters.status ? { status: this.toPrismaNotificationStatus(filters.status) } : {}),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            producerId: true,
            stand: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      orderId: notification.orderId,
      orderNumber: notification.order?.orderNumber ?? null,
      standName: notification.order?.stand.name ?? null,
      channel: notificationChannelMap[notification.channel],
      type: notificationTypeMap[notification.type],
      templateKey: notification.templateKey,
      maskedRecipient: this.maskRecipient(notification.recipient),
      status: notificationStatusMap[notification.status],
      provider: notification.provider,
      providerMessageId: notification.providerMessageId,
      errorMessage: notification.errorMessage,
      scheduledAt: notification.scheduledAt?.toISOString() ?? null,
      sentAt: notification.sentAt?.toISOString() ?? null,
      deliveredAt: notification.deliveredAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    }));
  }

  async queueOrderNotification(user: SessionUser, orderId: string, input: QueueOrderNotificationInput) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
    }

    if (user.role !== "platform_admin" && order.producerId !== user.producerId) {
      throw new ApiError("FORBIDDEN", "Bestellung ist nicht im erlaubten Produzenten-Scope.", 403);
    }

    if (input.channel === "whatsapp" && (!order.customer.whatsappOptIn || !order.customer.phoneNumber)) {
      throw new ApiError("WHATSAPP_OPT_IN_REQUIRED", "WhatsApp ist fuer diesen Kunden nicht aktiviert.", 422);
    }

    const channel = this.toPrismaNotificationChannel(input.channel);
    const type = this.toPrismaNotificationType(input.type);
    const notification = await this.db.notification.create({
      data: {
        userId: order.customerId,
        orderId: order.id,
        channel,
        type,
        templateKey: input.templateKey ?? `${input.channel}.${input.type}.v1`,
        recipient: input.channel === "whatsapp" ? order.customer.phoneNumber ?? "" : order.customer.email,
        status: NotificationStatus.PENDING,
        provider: input.channel,
      },
    });

    return {
      id: notification.id,
      orderId: notification.orderId,
      channel: notificationChannelMap[notification.channel],
      type: notificationTypeMap[notification.type],
      templateKey: notification.templateKey,
      maskedRecipient: this.maskRecipient(notification.recipient),
      status: notificationStatusMap[notification.status],
      createdAt: notification.createdAt.toISOString(),
      implementationNote: "Notification wurde persistiert; Provider-Versand bleibt entkoppelt vom Order-Flow.",
    };
  }

  private orderScopeWhere(user: SessionUser): Prisma.OrderWhereInput {
    return user.role === "platform_admin" ? {} : { producerId: user.producerId };
  }

  private standScopeWhere(user: SessionUser): Prisma.StandWhereInput {
    return user.role === "platform_admin" ? {} : { producerId: user.producerId };
  }

  private notificationScopeWhere(user: SessionUser): Prisma.NotificationWhereInput {
    return user.role === "platform_admin"
      ? {}
      : {
          order: {
            producerId: user.producerId,
          },
        };
  }

  private todayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
  }

  private dateFilter(date: string) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return {
      gte: start,
      lt: end,
    };
  }

  private maskRecipient(recipient: string) {
    if (recipient.includes("@")) {
      const [name, domain] = recipient.split("@");
      return `${name.slice(0, 2)}***@${domain}`;
    }

    if (recipient.length <= 4) {
      return "***";
    }

    return `${recipient.slice(0, 3)}***${recipient.slice(-2)}`;
  }

  private toPrismaOrderStatus(status: DomainOrderStatus) {
    switch (status) {
      case "draft":
        return OrderStatus.DRAFT;
      case "pending_payment":
        return OrderStatus.PENDING_PAYMENT;
      case "confirmed":
        return OrderStatus.CONFIRMED;
      case "ready_for_pickup":
        return OrderStatus.READY_FOR_PICKUP;
      case "picked_up":
        return OrderStatus.PICKED_UP;
      case "cancelled":
        return OrderStatus.CANCELLED;
      case "expired":
        return OrderStatus.EXPIRED;
      case "refunded":
        return OrderStatus.REFUNDED;
    }
  }

  private toPrismaNotificationChannel(channel: DomainNotificationChannel) {
    switch (channel) {
      case "email":
        return NotificationChannel.EMAIL;
      case "whatsapp":
        return NotificationChannel.WHATSAPP;
      case "push":
        return NotificationChannel.PUSH;
    }
  }

  private toPrismaNotificationStatus(status: DomainNotificationStatus) {
    switch (status) {
      case "pending":
        return NotificationStatus.PENDING;
      case "sent":
        return NotificationStatus.SENT;
      case "delivered":
        return NotificationStatus.DELIVERED;
      case "failed":
        return NotificationStatus.FAILED;
      case "cancelled":
        return NotificationStatus.CANCELLED;
    }
  }

  private toPrismaNotificationType(type: DomainNotificationType) {
    switch (type) {
      case "order_confirmed":
        return NotificationType.ORDER_CONFIRMED;
      case "payment_confirmed":
        return NotificationType.PAYMENT_CONFIRMED;
      case "pickup_reminder":
        return NotificationType.PICKUP_REMINDER;
      case "order_ready":
        return NotificationType.ORDER_READY;
      case "order_changed":
        return NotificationType.ORDER_CHANGED;
      case "picked_up":
        return NotificationType.PICKED_UP;
      case "order_cancelled":
        return NotificationType.ORDER_CANCELLED;
    }
  }
}

export const adminQueryService = new AdminQueryService();
