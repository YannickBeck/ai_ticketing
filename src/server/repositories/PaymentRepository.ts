import {
  InventoryEventType,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  QRTokenStatus,
  QRTokenType,
  type PaymentEvent as PaymentEventRecord,
  type PrismaClient,
} from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { prisma } from "@/server/db/prisma";
import type { SessionUser } from "@/server/domain/types";
import { createEmailProvider } from "@/server/providers/EmailProvider";
import type { StripePaymentEventResult } from "@/server/services/PaymentService";
import { QRCodeService } from "@/server/services/QRCodeService";

type Db = PrismaClient | Prisma.TransactionClient;
type OrderForPaymentMutation = Prisma.OrderGetPayload<{ include: { items: true; payment: true } }>;

export type OrderPaymentContext = {
  id: string;
  orderNumber: string;
  customerId: string;
  producerId: string;
  status: OrderStatus;
  productTotalCents: number;
  serviceFeeCents: number;
  totalAmountCents: number;
  currency: "EUR";
  connectedAccountId?: string;
  providerPaymentId?: string;
};

export class PaymentRepository {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly qrCodeService = new QRCodeService(),
  ) {}

  async getOrderForPaymentIntent(orderId: string, user: SessionUser): Promise<OrderPaymentContext> {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: { producer: true, payment: true },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
    }

    if (user.role !== "customer") {
      throw new ApiError("FORBIDDEN", "PaymentIntent darf nur vom bestellenden Kunden gestartet werden.", 403, {
        role: user.role,
      });
    }

    if (order.customerId !== user.id) {
      throw new ApiError("FORBIDDEN", "Bestellung gehoert nicht zum angemeldeten Kunden.", 403);
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new ApiError("INVALID_STATUS_TRANSITION", "Zahlung kann nur fuer pending_payment gestartet werden.", 409, {
        orderStatus: order.status,
      });
    }

    if (order.payment?.status === PaymentStatus.SUCCEEDED) {
      throw new ApiError("INVALID_STATUS_TRANSITION", "Bestellung ist bereits bezahlt.", 409);
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      producerId: order.producerId,
      status: order.status,
      productTotalCents: order.productTotalCents,
      serviceFeeCents: order.serviceFeeCents,
      totalAmountCents: order.totalAmountCents,
      currency: order.currency as "EUR",
      connectedAccountId: order.producer.paymentAccountId ?? undefined,
      providerPaymentId: order.payment?.providerPaymentId ?? undefined,
    };
  }

  async ensurePendingPayment(order: OrderPaymentContext) {
    return this.db.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.PENDING,
        amountTotalCents: order.totalAmountCents,
        productAmountCents: order.productTotalCents,
        serviceFeeCents: order.serviceFeeCents,
      },
      update: {
        status: PaymentStatus.PENDING,
        amountTotalCents: order.totalAmountCents,
        productAmountCents: order.productTotalCents,
        serviceFeeCents: order.serviceFeeCents,
      },
    });
  }

  async recordPaymentIntentCreated(order: OrderPaymentContext, providerPaymentId: string) {
    return this.db.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider: PaymentProvider.STRIPE,
        providerPaymentId,
        status: PaymentStatus.PENDING,
        amountTotalCents: order.totalAmountCents,
        productAmountCents: order.productTotalCents,
        serviceFeeCents: order.serviceFeeCents,
      },
      update: {
        providerPaymentId,
        status: PaymentStatus.PENDING,
        amountTotalCents: order.totalAmountCents,
        productAmountCents: order.productTotalCents,
        serviceFeeCents: order.serviceFeeCents,
      },
    });
  }

  async processStripePaymentEvent(event: StripePaymentEventResult) {
    if (!event.handled) {
      return this.recordUnhandledEvent(event);
    }

    if (!event.status) {
      throw new ApiError("VALIDATION_ERROR", "Gemapptes Stripe Event hat keinen Payment-Status.", 500, event);
    }

    return this.db.$transaction(async (tx) => {
      const existingEvent = await tx.paymentEvent.findUnique({
        where: { providerEventId: event.providerEventId },
      });

      if (existingEvent) {
        return this.processExistingPaymentEvent(tx, existingEvent, event);
      }

      const payment = await this.findPaymentForEvent(tx, event);
      const paymentEvent = await tx.paymentEvent.create({
        data: {
          paymentId: payment?.id,
          orderId: payment?.orderId ?? event.orderId,
          provider: PaymentProvider.STRIPE,
          providerEventId: event.providerEventId,
          providerPaymentId: event.providerPaymentId,
          type: event.rawType,
          mappedStatus: this.toPrismaPaymentStatus(event.status),
          handled: Boolean(payment),
        },
      });

      if (!payment) {
        return {
          duplicate: false,
          handled: false,
          deferred: true,
          providerEventId: event.providerEventId,
          paymentFound: false,
          status: event.status,
        };
      }

      switch (event.status) {
        case "succeeded":
          return this.applyPaymentSucceeded(tx, payment.orderId, payment.id, event, paymentEvent.id);
        case "failed":
          return this.applyPaymentFailed(tx, payment.orderId, payment.id, event, paymentEvent.id);
        case "refunded":
          return this.applyPaymentRefunded(tx, payment.orderId, payment.id, event, paymentEvent.id);
        default:
          return {
            duplicate: false,
            handled: true,
            providerEventId: event.providerEventId,
            status: event.status,
          };
      }
    });
  }

  private toPrismaPaymentStatus(status: StripePaymentEventResult["status"]) {
    switch (status) {
      case "pending":
        return PaymentStatus.PENDING;
      case "succeeded":
        return PaymentStatus.SUCCEEDED;
      case "failed":
        return PaymentStatus.FAILED;
      case "refunded":
        return PaymentStatus.REFUNDED;
      default:
        return null;
    }
  }

  private async processExistingPaymentEvent(
    tx: Db,
    existingEvent: PaymentEventRecord,
    event: StripePaymentEventResult,
  ) {
    if (existingEvent.handled) {
      return {
        duplicate: true,
        handled: true,
        providerEventId: existingEvent.providerEventId,
        orderId: existingEvent.orderId,
        status: existingEvent.mappedStatus,
      };
    }

    if (!event.handled || !event.status) {
      return {
        duplicate: true,
        handled: false,
        providerEventId: existingEvent.providerEventId,
      };
    }

    const payment = await this.findPaymentForEvent(tx, event);

    if (!payment) {
      return {
        duplicate: true,
        handled: false,
        deferred: true,
        providerEventId: existingEvent.providerEventId,
        paymentFound: false,
        status: event.status,
      };
    }

    const paymentEvent = await tx.paymentEvent.update({
      where: { id: existingEvent.id },
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        providerPaymentId: event.providerPaymentId,
        type: event.rawType,
        mappedStatus: this.toPrismaPaymentStatus(event.status),
        handled: true,
      },
    });

    switch (event.status) {
      case "succeeded":
        return this.applyPaymentSucceeded(tx, payment.orderId, payment.id, event, paymentEvent.id);
      case "failed":
        return this.applyPaymentFailed(tx, payment.orderId, payment.id, event, paymentEvent.id);
      case "refunded":
        return this.applyPaymentRefunded(tx, payment.orderId, payment.id, event, paymentEvent.id);
      default:
        return {
          duplicate: true,
          handled: true,
          providerEventId: existingEvent.providerEventId,
          status: event.status,
        };
    }
  }

  private async recordUnhandledEvent(event: StripePaymentEventResult) {
    const existingEvent = await this.db.paymentEvent.findUnique({
      where: { providerEventId: event.providerEventId },
    });

    if (existingEvent) {
      return {
        duplicate: true,
        handled: false,
        providerEventId: event.providerEventId,
      };
    }

    await this.db.paymentEvent.create({
      data: {
        provider: PaymentProvider.STRIPE,
        providerEventId: event.providerEventId,
        providerPaymentId: event.providerPaymentId,
        type: event.rawType,
        handled: false,
      },
    });

    return {
      duplicate: false,
      handled: false,
      providerEventId: event.providerEventId,
    };
  }

  private async findPaymentForEvent(tx: Db, event: StripePaymentEventResult) {
    if (event.providerPaymentId) {
      const payment = await tx.payment.findFirst({
        where: {
          provider: PaymentProvider.STRIPE,
          providerPaymentId: event.providerPaymentId,
        },
      });

      if (payment) {
        return payment;
      }
    }

    if (event.orderId) {
      return tx.payment.findUnique({ where: { orderId: event.orderId } });
    }

    return null;
  }

  private async applyPaymentSucceeded(
    tx: Db,
    orderId: string,
    paymentId: string,
    event: StripePaymentEventResult,
    paymentEventId: string,
  ) {
    const order = await this.getOrderForStatusMutation(tx, orderId);
    const paymentStatus = order.payment?.status;

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.EXPIRED ||
      order.status === OrderStatus.REFUNDED ||
      paymentStatus === PaymentStatus.FAILED ||
      paymentStatus === PaymentStatus.REFUNDED
    ) {
      return this.ignoreConflictingPaymentEvent(event, paymentEventId, order, "success_after_terminal_state");
    }

    const existingActiveQr = await tx.qRToken.findFirst({
      where: {
        type: QRTokenType.ORDER,
        referenceId: order.id,
        status: QRTokenStatus.ACTIVE,
      },
    });

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCEEDED,
        providerEventId: event.providerEventId,
        providerPaymentId: event.providerPaymentId,
      },
    });

    if (order.status === OrderStatus.PENDING_PAYMENT) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });
    }

    if (!existingActiveQr) {
      const qrToken = this.qrCodeService.createOrderPickupToken(order.id, order.pickupSlotEnd);
      await tx.qRToken.create({
        data: {
          id: qrToken.tokenId,
          type: QRTokenType.ORDER,
          referenceId: order.id,
          tokenNonce: qrToken.tokenNonce,
          tokenHash: qrToken.tokenHash,
          expiresAt: qrToken.expiresAt,
          status: QRTokenStatus.ACTIVE,
        },
      });
    }

    await this.createOrderConfirmedNotifications(tx, order.id, order.customerId);
    await this.sendPendingNotifications(tx, order.id);

    return {
      duplicate: false,
      handled: true,
      providerEventId: event.providerEventId,
      paymentEventId,
      orderId: order.id,
      orderStatus: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCEEDED,
    };
  }

  private async applyPaymentFailed(
    tx: Db,
    orderId: string,
    paymentId: string,
    event: StripePaymentEventResult,
    paymentEventId: string,
  ) {
    const order = await this.getOrderForStatusMutation(tx, orderId);

    if (order.status !== OrderStatus.PENDING_PAYMENT || order.payment?.status !== PaymentStatus.PENDING) {
      return this.ignoreConflictingPaymentEvent(event, paymentEventId, order, "failure_after_non_pending_state");
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        providerEventId: event.providerEventId,
        providerPaymentId: event.providerPaymentId,
      },
    });

    if (order.status === OrderStatus.PENDING_PAYMENT) {
      await this.releaseReservedInventory(tx, order);
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });
    }

    return {
      duplicate: false,
      handled: true,
      providerEventId: event.providerEventId,
      paymentEventId,
      orderId: order.id,
      orderStatus: OrderStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
    };
  }

  private async applyPaymentRefunded(
    tx: Db,
    orderId: string,
    paymentId: string,
    event: StripePaymentEventResult,
    paymentEventId: string,
  ) {
    const order = await this.getOrderForStatusMutation(tx, orderId);

    if (order.status === OrderStatus.REFUNDED || order.payment?.status === PaymentStatus.REFUNDED) {
      return this.ignoreConflictingPaymentEvent(event, paymentEventId, order, "refund_already_applied");
    }

    if (order.payment?.status !== PaymentStatus.SUCCEEDED) {
      return this.ignoreConflictingPaymentEvent(event, paymentEventId, order, "refund_without_succeeded_payment");
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        providerEventId: event.providerEventId,
        providerPaymentId: event.providerPaymentId,
        refundedAmountCents: order.totalAmountCents,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.REFUNDED },
    });

    return {
      duplicate: false,
      handled: true,
      providerEventId: event.providerEventId,
      paymentEventId,
      orderId: order.id,
      orderStatus: OrderStatus.REFUNDED,
      paymentStatus: PaymentStatus.REFUNDED,
    };
  }

  private async getOrderForStatusMutation(tx: Db, orderId: string) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung zum Payment wurde nicht gefunden.", 404);
    }

    return order;
  }

  private ignoreConflictingPaymentEvent(
    event: StripePaymentEventResult,
    paymentEventId: string,
    order: OrderForPaymentMutation,
    reason: string,
  ) {
    return {
      duplicate: false,
      handled: true,
      ignored: true,
      reason,
      providerEventId: event.providerEventId,
      paymentEventId,
      orderId: order.id,
      orderStatus: order.status,
      paymentStatus: order.payment?.status ?? null,
    };
  }

  private async releaseReservedInventory(
    tx: Db,
    order: OrderForPaymentMutation,
  ) {
    for (const item of order.items) {
      const inventory = await tx.inventory.update({
        where: { id: item.standProductId },
        data: {
          reservedQuantity: {
            decrement: item.quantity,
          },
        },
      });

      await tx.inventoryEvent.create({
        data: {
          standId: order.standId,
          productId: item.productId,
          orderId: order.id,
          type: InventoryEventType.RESERVATION_RELEASE,
          quantityDelta: item.quantity,
          stockAfter: inventory.stockQuantity,
          reservedAfter: inventory.reservedQuantity,
          note: "Payment failed or cancelled before confirmation.",
        },
      });
    }
  }

  private async sendPendingNotifications(tx: Db, orderId: string) {
    const pending = await tx.notification.findMany({
      where: {
        orderId,
        status: NotificationStatus.PENDING,
        channel: NotificationChannel.EMAIL,
      },
      include: { order: { include: { customer: true } } },
    });

    const emailProvider = createEmailProvider();

    for (const notification of pending) {
      try {
        const vars: Record<string, string> = {
          customerName: notification.order?.customer?.name ?? "",
          orderNumber: notification.order?.id ?? "",
          orderId: notification.orderId ?? "",
        };

        const result = await emailProvider.send({
          to: notification.recipient,
          subject: "Spargelstand Bestellung",
          templateKey: notification.templateKey,
          variables: vars,
        });

        await tx.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.SENT,
            providerMessageId: result.providerMessageId,
            sentAt: new Date(),
            provider: result.provider,
          },
        });
      } catch {
        await tx.notification.update({
          where: { id: notification.id },
          data: {
            status: NotificationStatus.FAILED,
            errorMessage: "Versand fehlgeschlagen",
          },
        });
      }
    }
  }

  private async createOrderConfirmedNotifications(tx: Db, orderId: string, userId: string) {
    const existing = await tx.notification.findFirst({
      where: {
        orderId,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_CONFIRMED,
      },
    });

    if (existing) {
      return;
    }

    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true },
    });

    await tx.notification.create({
      data: {
        userId,
        orderId,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.ORDER_CONFIRMED,
        templateKey: "email.order_confirmed.v1",
        recipient: user.email,
        status: NotificationStatus.PENDING,
        provider: "email",
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
