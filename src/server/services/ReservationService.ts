import { randomInt } from "node:crypto";

import {
  InventoryEventType,
  InventoryStatus as PrismaInventoryStatus,
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
  Prisma,
  QRTokenStatus,
  QRTokenType,
  StandStatus,
  type PrismaClient,
} from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { prisma } from "@/server/db/prisma";
import type {
  InventoryStatus,
  OrderStatus,
  PaymentStatus,
  SessionUser,
} from "@/server/domain/types";
import { inventoryService } from "@/server/services/InventoryService";
import { QRCodeService } from "@/server/services/QRCodeService";

type Db = PrismaClient | Prisma.TransactionClient;
type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    payment: true;
  };
}>;

type CreateReservationInput = {
  user: SessionUser;
  standId: string;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  items: Array<{ productId: string; quantity: number }>;
};

type PickupInput = {
  user: SessionUser;
  standId: string;
  token?: string;
  orderNumber?: string;
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["confirmed", "cancelled", "expired"],
  confirmed: ["ready_for_pickup", "picked_up", "cancelled", "refunded"],
  ready_for_pickup: ["picked_up", "cancelled", "refunded"],
  picked_up: ["refunded"],
  cancelled: [],
  expired: [],
  refunded: [],
};

const orderStatusMap: Record<PrismaOrderStatus, OrderStatus> = {
  [PrismaOrderStatus.DRAFT]: "draft",
  [PrismaOrderStatus.PENDING_PAYMENT]: "pending_payment",
  [PrismaOrderStatus.CONFIRMED]: "confirmed",
  [PrismaOrderStatus.READY_FOR_PICKUP]: "ready_for_pickup",
  [PrismaOrderStatus.PICKED_UP]: "picked_up",
  [PrismaOrderStatus.CANCELLED]: "cancelled",
  [PrismaOrderStatus.EXPIRED]: "expired",
  [PrismaOrderStatus.REFUNDED]: "refunded",
};

const paymentStatusMap: Record<PrismaPaymentStatus, PaymentStatus> = {
  [PrismaPaymentStatus.PENDING]: "pending",
  [PrismaPaymentStatus.SUCCEEDED]: "succeeded",
  [PrismaPaymentStatus.FAILED]: "failed",
  [PrismaPaymentStatus.REFUNDED]: "refunded",
};

const inventoryStatusMap: Record<InventoryStatus, PrismaInventoryStatus> = {
  available: PrismaInventoryStatus.AVAILABLE,
  low_stock: PrismaInventoryStatus.LOW_STOCK,
  out_of_stock: PrismaInventoryStatus.OUT_OF_STOCK,
  next_delivery_expected: PrismaInventoryStatus.NEXT_DELIVERY_EXPECTED,
};

export class ReservationService {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly qrCodeService = new QRCodeService(),
  ) {}

  validateTransition(from: OrderStatus, to: OrderStatus) {
    if (!allowedTransitions[from].includes(to)) {
      throw new ApiError("INVALID_STATUS_TRANSITION", "Statuswechsel ist nicht erlaubt.", 409, {
        from,
        to,
      });
    }
  }

  async createReservation(input: CreateReservationInput) {
    if (input.user.role !== "customer") {
      throw new ApiError("FORBIDDEN", "Nur Kunden duerfen Reservierungen anlegen.", 403, {
        role: input.user.role,
      });
    }

    const pickupSlotStart = new Date(input.pickupSlotStart);
    const pickupSlotEnd = new Date(input.pickupSlotEnd);

    if (pickupSlotStart >= pickupSlotEnd) {
      throw new ApiError("VALIDATION_ERROR", "Abholfenster ist ungueltig.", 400);
    }

    const requestedItems = this.aggregateItems(input.items);

    return this.db.$transaction(
      async (tx) => {
        const stand = await tx.stand.findUnique({
          where: { id: input.standId },
        });

        if (!stand) {
          throw new ApiError("NOT_FOUND", "Stand wurde nicht gefunden.", 404);
        }

        if (stand.status !== StandStatus.OPEN) {
          throw new ApiError("INVALID_STATUS_TRANSITION", "Stand ist aktuell nicht geoeffnet.", 409, {
            standStatus: stand.status,
          });
        }

        const orderLines = [];
        let productTotalCents = 0;

        for (const item of requestedItems) {
          await this.lockInventory(tx, input.standId, item.productId);

          const inventory = await tx.inventory.findUnique({
            where: {
              standId_productId: {
                standId: input.standId,
                productId: item.productId,
              },
            },
            include: { product: true },
          });

          if (!inventory || !inventory.product.active) {
            throw new ApiError("NOT_FOUND", "Produkt ist an diesem Stand nicht verfuegbar.", 404, {
              productId: item.productId,
            });
          }

          if (inventory.product.producerId !== stand.producerId) {
            throw new ApiError("VALIDATION_ERROR", "Produkt gehoert nicht zum Produzenten des Standes.", 400);
          }

          const snapshot = {
            stockQuantity: Number(inventory.stockQuantity),
            reservedQuantity: Number(inventory.reservedQuantity),
            safetyBuffer: Number(inventory.safetyBuffer),
            lowStockThreshold: Number(inventory.lowStockThreshold),
            nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
            manuallyOutOfStock: inventory.status === PrismaInventoryStatus.OUT_OF_STOCK,
          };
          const hold = inventoryService.createReservationHold(snapshot, item.quantity);
          const totalPriceCents = Math.round(inventory.product.priceCents * item.quantity);
          productTotalCents += totalPriceCents;

          orderLines.push({
            inventoryId: inventory.id,
            productId: inventory.productId,
            quantity: item.quantity,
            unit: inventory.product.unit,
            unitPriceCents: inventory.product.priceCents,
            totalPriceCents,
            nextStatus: inventoryStatusMap[hold.status],
          });
        }

        const serviceFeeCents = this.calculateServiceFeeCents();
        const order = await tx.order.create({
          data: {
            orderNumber: await this.generateUniqueOrderNumber(tx),
            customerId: input.user.id,
            producerId: stand.producerId,
            standId: stand.id,
            pickupSlotStart,
            pickupSlotEnd,
            status: PrismaOrderStatus.PENDING_PAYMENT,
            productTotalCents,
            serviceFeeCents,
            totalAmountCents: productTotalCents + serviceFeeCents,
            currency: "EUR",
            expiresAt: new Date(Date.now() + 1000 * 60 * 10),
            items: {
              create: orderLines.map((line) => ({
                productId: line.productId,
                standProductId: line.inventoryId,
                quantity: line.quantity.toString(),
                unit: line.unit,
                unitPriceCents: line.unitPriceCents,
                totalPriceCents: line.totalPriceCents,
              })),
            },
          },
          include: {
            items: { include: { product: true } },
            payment: true,
          },
        });

        for (const line of orderLines) {
          const inventory = await tx.inventory.update({
            where: { id: line.inventoryId },
            data: {
              reservedQuantity: { increment: line.quantity },
              status: line.nextStatus,
            },
          });

          await tx.inventoryEvent.create({
            data: {
              standId: stand.id,
              productId: line.productId,
              orderId: order.id,
              type: InventoryEventType.RESERVATION_HOLD,
              quantityDelta: new Prisma.Decimal(line.quantity),
              stockAfter: inventory.stockQuantity,
              reservedAfter: inventory.reservedQuantity,
              actorId: input.user.id,
              note: "Reservation hold created during checkout.",
            },
          });
        }

        return this.toOrderDto(order);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async getOrder(orderId: string) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
    }

    return this.toOrderDto(order);
  }

  async getOrderQr(orderId: string) {
    const order = await this.db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
    }

    if (
      (order.status !== PrismaOrderStatus.CONFIRMED && order.status !== PrismaOrderStatus.READY_FOR_PICKUP) ||
      order.payment?.status !== PrismaPaymentStatus.SUCCEEDED
    ) {
      throw new ApiError("PAYMENT_NOT_CONFIRMED", "QR-Code ist erst nach erfolgreicher Zahlung verfuegbar.", 409, {
        orderStatus: order.status,
        paymentStatus: order.payment?.status ?? null,
      });
    }

    const qrToken = await this.ensureActiveOrderQrToken(order.id, order.pickupSlotEnd);

    return {
      order: this.toOrderDto(order),
      qrLink: qrToken.qrLink,
      tokenHashPreview: qrToken.tokenHash.slice(0, 12),
      expiresAt: qrToken.expiresAt.toISOString(),
      securityNote: "QRToken-Klartext wird nicht gespeichert; gespeichert werden Hash und Nonce.",
    };
  }

  async cancelOrder(orderId: string) {
    return this.db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      });

      if (!order) {
        throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
      }

      this.validateTransition(orderStatusMap[order.status], "cancelled");

      if (
        order.status === PrismaOrderStatus.PENDING_PAYMENT ||
        order.status === PrismaOrderStatus.CONFIRMED ||
        order.status === PrismaOrderStatus.READY_FOR_PICKUP
      ) {
        await this.releaseReservedInventory(tx, order, "Reservation cancelled.");
      }

      const cancelledOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: PrismaOrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      });

      await tx.qRToken.updateMany({
        where: {
          type: QRTokenType.ORDER,
          referenceId: order.id,
          status: QRTokenStatus.ACTIVE,
        },
        data: { status: QRTokenStatus.REVOKED },
      });

      return this.toOrderDto(cancelledOrder);
    });
  }

  async listStaffOrders(standId: string) {
    const orders = await this.db.order.findMany({
      where: {
        standId,
        status: {
          in: [PrismaOrderStatus.CONFIRMED, PrismaOrderStatus.READY_FOR_PICKUP],
        },
      },
      orderBy: { pickupSlotStart: "asc" },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    return orders.map((order) => this.toOrderDto(order));
  }

  async listAdminOrders(producerId?: string) {
    const orders = await this.db.order.findMany({
      where: producerId ? { producerId } : undefined,
      orderBy: { pickupSlotStart: "desc" },
      include: {
        stand: true,
        items: { include: { product: true } },
        payment: true,
      },
    });

    return orders.map((order) => ({
      ...this.toOrderDto(order),
      standName: order.stand.name,
    }));
  }

  async scanOrderToken(input: { standId: string; token: string }) {
    const payload = this.qrCodeService.verifySignedToken(input.token);

    if (payload.type !== "order") {
      throw new ApiError("FORBIDDEN", "QRToken ist kein Order-Token.", 403);
    }

    const tokenHash = this.qrCodeService.hashToken(input.token);
    const qrToken = await this.db.qRToken.findUnique({
      where: { tokenHash },
    });

    if (!qrToken || qrToken.status !== QRTokenStatus.ACTIVE) {
      throw new ApiError("QR_TOKEN_ALREADY_USED", "QRToken ist ungueltig oder bereits verwendet.", 409);
    }

    if (qrToken.expiresAt && qrToken.expiresAt < new Date()) {
      throw new ApiError("RESERVATION_EXPIRED", "QRToken ist abgelaufen.", 410);
    }

    const order = await this.db.order.findUnique({
      where: { id: payload.referenceId },
      include: {
        items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new ApiError("NOT_FOUND", "Bestellung zum QRToken wurde nicht gefunden.", 404);
    }

    if (order.id !== qrToken.referenceId || order.standId !== input.standId) {
      throw new ApiError("FORBIDDEN", "QRToken gehoert nicht zu diesem Stand.", 403);
    }

    return {
      valid: true,
      standId: input.standId,
      tokenHashPreview: tokenHash.slice(0, 12),
      order: this.toOrderDto(order),
    };
  }

  async confirmPickup(orderId: string, input: PickupInput) {
    return this.db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      });

      if (!order) {
        throw new ApiError("NOT_FOUND", "Bestellung wurde nicht gefunden.", 404);
      }

      if (order.standId !== input.standId) {
        throw new ApiError("FORBIDDEN", "Bestellung gehoert nicht zu diesem Stand.", 403);
      }

      if (!input.token && !input.orderNumber) {
        throw new ApiError("VALIDATION_ERROR", "QRToken oder Fallback-Code ist erforderlich.", 400);
      }

      if (order.status !== PrismaOrderStatus.CONFIRMED && order.status !== PrismaOrderStatus.READY_FOR_PICKUP) {
        throw new ApiError("INVALID_STATUS_TRANSITION", "Bestellung ist nicht abholbereit.", 409, {
          orderStatus: order.status,
        });
      }

      if (order.payment?.status !== PrismaPaymentStatus.SUCCEEDED) {
        throw new ApiError("PAYMENT_NOT_CONFIRMED", "Bestellung ist nicht bezahlt.", 409);
      }

      const qrToken = input.token
        ? await this.assertPickupToken(tx, input.token, order.id)
        : await this.assertFallbackCode(tx, input.orderNumber, order);

      for (const item of order.items) {
        await this.lockInventoryById(tx, item.standProductId);
        const inventory = await tx.inventory.findUnique({
          where: { id: item.standProductId },
        });

        if (!inventory) {
          throw new ApiError("NOT_FOUND", "Inventory zur Order wurde nicht gefunden.", 404);
        }

        const quantity = Number(item.quantity);
        const nextStockQuantity = Math.max(0, Number(inventory.stockQuantity) - quantity);
        const nextReservedQuantity = Math.max(0, Number(inventory.reservedQuantity) - quantity);
        const nextStatus = inventoryStatusMap[
          inventoryService.calculateStatus({
            stockQuantity: nextStockQuantity,
            reservedQuantity: nextReservedQuantity,
            safetyBuffer: Number(inventory.safetyBuffer),
            lowStockThreshold: Number(inventory.lowStockThreshold),
            nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
          })
        ];

        const updatedInventory = await tx.inventory.update({
          where: { id: item.standProductId },
          data: {
            stockQuantity: nextStockQuantity.toString(),
            reservedQuantity: nextReservedQuantity.toString(),
            status: nextStatus,
          },
        });

        await tx.inventoryEvent.create({
          data: {
            standId: order.standId,
            productId: item.productId,
            orderId: order.id,
            type: InventoryEventType.PICKUP,
            quantityDelta: new Prisma.Decimal(quantity).negated(),
            stockAfter: updatedInventory.stockQuantity,
            reservedAfter: updatedInventory.reservedQuantity,
            actorId: input.user.id,
            note: "Order picked up by customer.",
          },
        });
      }

      if (qrToken) {
        await tx.qRToken.update({
          where: { id: qrToken.id },
          data: {
            status: QRTokenStatus.USED,
            usedAt: new Date(),
            usedByUserId: input.user.id,
          },
        });
      }

      const pickedUpOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: PrismaOrderStatus.PICKED_UP,
          pickedUpAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      });

      return this.toOrderDto(pickedUpOrder);
    });
  }

  async expirePendingReservations(now = new Date()) {
    return this.db.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: {
          status: PrismaOrderStatus.PENDING_PAYMENT,
          expiresAt: {
            lte: now,
          },
        },
        include: {
          items: { include: { product: true } },
          payment: true,
        },
      });

      const expiredOrderIds: string[] = [];

      for (const order of orders) {
        await this.releaseReservedInventory(tx, order, "Pending payment reservation expired.");

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: PrismaOrderStatus.EXPIRED,
          },
        });

        if (order.payment?.status === PrismaPaymentStatus.PENDING) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: PrismaPaymentStatus.FAILED,
            },
          });
        }

        await tx.qRToken.updateMany({
          where: {
            type: QRTokenType.ORDER,
            referenceId: order.id,
            status: QRTokenStatus.ACTIVE,
          },
          data: {
            status: QRTokenStatus.REVOKED,
          },
        });

        expiredOrderIds.push(order.id);
      }

      return {
        expiredCount: expiredOrderIds.length,
        expiredOrderIds,
      };
    });
  }

  private aggregateItems(items: Array<{ productId: string; quantity: number }>) {
    const aggregate = new Map<string, number>();

    for (const item of items) {
      aggregate.set(item.productId, (aggregate.get(item.productId) ?? 0) + item.quantity);
    }

    return Array.from(aggregate, ([productId, quantity]) => ({ productId, quantity }));
  }

  private calculateServiceFeeCents() {
    return 99;
  }

  private async generateUniqueOrderNumber(tx: Db) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const orderNumber = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
      const existing = await tx.order.findUnique({ where: { orderNumber } });

      if (!existing) {
        return orderNumber;
      }
    }

    throw new ApiError("INTERNAL_ERROR", "Order-Nummer konnte nicht erzeugt werden.", 500);
  }

  private async ensureActiveOrderQrToken(orderId: string, pickupSlotEnd: Date) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.qRToken.findFirst({
        where: {
          type: QRTokenType.ORDER,
          referenceId: orderId,
          status: QRTokenStatus.ACTIVE,
        },
      });

      if (existing?.expiresAt && existing.expiresAt < new Date()) {
        await tx.qRToken.update({
          where: { id: existing.id },
          data: { status: QRTokenStatus.EXPIRED },
        });
      } else if (existing?.tokenNonce && existing.expiresAt) {
        const rebuilt = this.qrCodeService.buildStoredOrderPickupToken({
          tokenId: existing.id,
          tokenNonce: existing.tokenNonce,
          orderId,
          expiresAt: existing.expiresAt,
        });

        if (rebuilt.tokenHash === existing.tokenHash) {
          return {
            qrLink: rebuilt.qrLink,
            tokenHash: rebuilt.tokenHash,
            expiresAt: existing.expiresAt,
          };
        }

        await tx.qRToken.update({
          where: { id: existing.id },
          data: { status: QRTokenStatus.REVOKED },
        });
      } else if (existing) {
        await tx.qRToken.update({
          where: { id: existing.id },
          data: { status: QRTokenStatus.REVOKED },
        });
      }

      const qrToken = this.qrCodeService.createOrderPickupToken(orderId, pickupSlotEnd);
      await tx.qRToken.create({
        data: {
          id: qrToken.tokenId,
          type: QRTokenType.ORDER,
          referenceId: orderId,
          tokenNonce: qrToken.tokenNonce,
          tokenHash: qrToken.tokenHash,
          expiresAt: qrToken.expiresAt,
          status: QRTokenStatus.ACTIVE,
        },
      });

      return {
        qrLink: qrToken.qrLink,
        tokenHash: qrToken.tokenHash,
        expiresAt: qrToken.expiresAt,
      };
    });
  }

  private async assertPickupToken(tx: Db, token: string, orderId: string) {
    const payload = this.qrCodeService.verifySignedToken(token);

    if (payload.type !== "order" || payload.referenceId !== orderId) {
      throw new ApiError("FORBIDDEN", "QRToken gehoert nicht zu dieser Bestellung.", 403);
    }

    const qrToken = await tx.qRToken.findUnique({
      where: { tokenHash: this.qrCodeService.hashToken(token) },
    });

    if (!qrToken || qrToken.status !== QRTokenStatus.ACTIVE) {
      throw new ApiError("QR_TOKEN_ALREADY_USED", "QRToken ist ungueltig oder bereits verwendet.", 409);
    }

    return qrToken;
  }

  private async assertFallbackCode(
    tx: Db,
    orderNumber: string | undefined,
    order: OrderWithDetails,
  ) {
    if (!orderNumber || order.orderNumber.toUpperCase() !== orderNumber.toUpperCase()) {
      throw new ApiError("FORBIDDEN", "Fallback-Code passt nicht zur Bestellung.", 403);
    }

    return tx.qRToken.findFirst({
      where: {
        type: QRTokenType.ORDER,
        referenceId: order.id,
        status: QRTokenStatus.ACTIVE,
      },
    });
  }

  private async releaseReservedInventory(tx: Db, order: OrderWithDetails, note: string) {
    for (const item of order.items) {
      await this.lockInventoryById(tx, item.standProductId);
      const inventory = await tx.inventory.findUnique({
        where: { id: item.standProductId },
      });

      if (!inventory) {
        continue;
      }

      const quantity = Number(item.quantity);
      const nextReservedQuantity = Math.max(0, Number(inventory.reservedQuantity) - quantity);
      const nextStatus = inventoryStatusMap[
        inventoryService.calculateStatus({
          stockQuantity: Number(inventory.stockQuantity),
          reservedQuantity: nextReservedQuantity,
          safetyBuffer: Number(inventory.safetyBuffer),
          lowStockThreshold: Number(inventory.lowStockThreshold),
          nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
        })
      ];

      const updatedInventory = await tx.inventory.update({
        where: { id: item.standProductId },
        data: {
          reservedQuantity: nextReservedQuantity.toString(),
          status: nextStatus,
        },
      });

      await tx.inventoryEvent.create({
        data: {
          standId: order.standId,
          productId: item.productId,
          orderId: order.id,
          type: InventoryEventType.RESERVATION_RELEASE,
          quantityDelta: new Prisma.Decimal(quantity),
          stockAfter: updatedInventory.stockQuantity,
          reservedAfter: updatedInventory.reservedQuantity,
          note,
        },
      });
    }
  }

  private async lockInventory(tx: Db, standId: string, productId: string) {
    await tx.$queryRaw`
      SELECT id
      FROM "Inventory"
      WHERE "standId" = ${standId} AND "productId" = ${productId}
      FOR UPDATE
    `;
  }

  private async lockInventoryById(tx: Db, inventoryId: string) {
    await tx.$queryRaw`
      SELECT id
      FROM "Inventory"
      WHERE id = ${inventoryId}
      FOR UPDATE
    `;
  }

  private toOrderDto(order: OrderWithDetails) {
    return {
      id: order.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      producerId: order.producerId,
      standId: order.standId,
      status: orderStatusMap[order.status],
      pickupSlotStart: order.pickupSlotStart.toISOString(),
      pickupSlotEnd: order.pickupSlotEnd.toISOString(),
      expiresAt: order.expiresAt?.toISOString() ?? null,
      pickedUpAt: order.pickedUpAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      productTotalCents: order.productTotalCents,
      serviceFeeCents: order.serviceFeeCents,
      totalAmountCents: order.totalAmountCents,
      currency: order.currency as "EUR",
      paymentStatus: order.payment ? paymentStatusMap[order.payment.status] : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        standProductId: item.standProductId,
        name: item.product.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPriceCents: item.unitPriceCents,
        totalPriceCents: item.totalPriceCents,
      })),
    };
  }
}

export const reservationService = new ReservationService();
