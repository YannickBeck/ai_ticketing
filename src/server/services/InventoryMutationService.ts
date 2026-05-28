import {
  InventoryEventType,
  InventoryStatus,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { prisma } from "@/server/db/prisma";
import type { SessionUser } from "@/server/domain/types";
import { inventoryService } from "@/server/services/InventoryService";

type InventoryMutationInput = {
  user: SessionUser;
  standId: string;
  productId: string;
  stockQuantity?: number;
  quantityDelta?: number;
  safetyBuffer?: number;
  lowStockThreshold?: number;
  nextDeliveryAt?: string | null;
  note?: string;
  eventType?: InventoryEventType;
};

const statusMap = {
  available: InventoryStatus.AVAILABLE,
  low_stock: InventoryStatus.LOW_STOCK,
  out_of_stock: InventoryStatus.OUT_OF_STOCK,
  next_delivery_expected: InventoryStatus.NEXT_DELIVERY_EXPECTED,
};

export class InventoryMutationService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async listInventory(producerId?: string) {
    const inventories = await this.db.inventory.findMany({
      where: producerId
        ? {
            stand: {
              producerId,
            },
          }
        : undefined,
      include: {
        product: true,
        stand: true,
      },
      orderBy: [{ stand: { name: "asc" } }, { product: { name: "asc" } }],
    });

    return inventories.map((inventory) => this.toDto(inventory));
  }

  async updateInventory(input: InventoryMutationInput) {
    if (input.stockQuantity !== undefined && input.quantityDelta !== undefined) {
      throw new ApiError("VALIDATION_ERROR", "stockQuantity und quantityDelta duerfen nicht kombiniert werden.", 400);
    }

    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "Inventory"
        WHERE "standId" = ${input.standId} AND "productId" = ${input.productId}
        FOR UPDATE
      `;

      const inventory = await tx.inventory.findUnique({
        where: {
          standId_productId: {
            standId: input.standId,
            productId: input.productId,
          },
        },
        include: {
          product: true,
          stand: true,
        },
      });

      if (!inventory) {
        throw new ApiError("NOT_FOUND", "Inventory wurde nicht gefunden.", 404);
      }

      this.assertCanMutateInventory(input.user, inventory.stand.producerId);

      const currentStock = Number(inventory.stockQuantity);
      const nextStock =
        input.stockQuantity ?? (input.quantityDelta !== undefined ? currentStock + input.quantityDelta : currentStock);
      const nextSafetyBuffer = input.safetyBuffer ?? Number(inventory.safetyBuffer);
      const nextLowStockThreshold = input.lowStockThreshold ?? Number(inventory.lowStockThreshold);
      const nextDeliveryAt =
        input.nextDeliveryAt === undefined
          ? inventory.nextDeliveryAt
          : input.nextDeliveryAt === null
            ? null
            : new Date(input.nextDeliveryAt);

      if (nextStock < 0) {
        throw new ApiError("VALIDATION_ERROR", "Bestand darf nicht negativ werden.", 400);
      }

      const nextStatus = inventoryService.calculateStatus({
        stockQuantity: nextStock,
        reservedQuantity: Number(inventory.reservedQuantity),
        safetyBuffer: nextSafetyBuffer,
        lowStockThreshold: nextLowStockThreshold,
        nextDeliveryAt: nextDeliveryAt?.toISOString() ?? null,
      });
      const stockDelta = nextStock - currentStock;

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          stockQuantity: nextStock.toString(),
          safetyBuffer: nextSafetyBuffer.toString(),
          lowStockThreshold: nextLowStockThreshold.toString(),
          nextDeliveryAt,
          status: statusMap[nextStatus],
          updatedByUserId: input.user.id,
        },
        include: {
          product: true,
          stand: true,
        },
      });

      await tx.inventoryEvent.create({
        data: {
          standId: input.standId,
          productId: input.productId,
          type: input.eventType ?? InventoryEventType.MANUAL_UPDATE,
          quantityDelta: new Prisma.Decimal(stockDelta),
          stockAfter: updated.stockQuantity,
          reservedAfter: updated.reservedQuantity,
          actorId: input.user.id,
          note: input.note,
        },
      });

      return this.toDto(updated);
    });
  }

  async markOutOfStock(input: {
    user: SessionUser;
    standId: string;
    productId: string;
    note?: string;
    nextDeliveryAt?: string | null;
  }) {
    return this.db.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: {
          standId_productId: {
            standId: input.standId,
            productId: input.productId,
          },
        },
        include: {
          product: true,
          stand: true,
        },
      });

      if (!inventory) {
        throw new ApiError("NOT_FOUND", "Inventory wurde nicht gefunden.", 404);
      }

      this.assertCanMutateInventory(input.user, inventory.stand.producerId);

      const updated = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          status: input.nextDeliveryAt ? InventoryStatus.NEXT_DELIVERY_EXPECTED : InventoryStatus.OUT_OF_STOCK,
          nextDeliveryAt:
            input.nextDeliveryAt === undefined
              ? inventory.nextDeliveryAt
              : input.nextDeliveryAt === null
                ? null
                : new Date(input.nextDeliveryAt),
          updatedByUserId: input.user.id,
        },
        include: {
          product: true,
          stand: true,
        },
      });

      await tx.inventoryEvent.create({
        data: {
          standId: input.standId,
          productId: input.productId,
          type: InventoryEventType.OUT_OF_STOCK,
          quantityDelta: new Prisma.Decimal(0),
          stockAfter: updated.stockQuantity,
          reservedAfter: updated.reservedQuantity,
          actorId: input.user.id,
          note: input.note ?? "Marked out of stock by staff/admin.",
        },
      });

      return this.toDto(updated);
    });
  }

  /** Create a brand-new inventory record for a (stand, product) pair that has no row yet. */
  async createInventory(input: InventoryMutationInput) {
    const stand = await this.db.stand.findUnique({ where: { id: input.standId } });
    if (!stand) throw new ApiError("NOT_FOUND", "Stand nicht gefunden.", 404);

    this.assertCanMutateInventory(input.user, stand.producerId);

    const stockQty = input.stockQuantity ?? 0;
    const safetyBuffer = input.safetyBuffer ?? 0;
    const lowStockThreshold = input.lowStockThreshold ?? 0;
    const domainStatus = inventoryService.calculateStatus({
      stockQuantity: stockQty,
      reservedQuantity: 0,
      safetyBuffer,
      lowStockThreshold,
    });

    const created = await this.db.inventory.create({
      data: {
        standId: input.standId,
        productId: input.productId,
        stockQuantity: stockQty,
        reservedQuantity: 0,
        safetyBuffer,
        lowStockThreshold,
        status: statusMap[domainStatus],
        updatedByUserId: input.user.id,
        nextDeliveryAt: input.nextDeliveryAt ? new Date(input.nextDeliveryAt) : null,
      },
      include: { product: true, stand: true },
    });

    return this.toDto(created);
  }

  /** Update if the inventory row already exists, create it otherwise. */
  async upsertInventory(input: InventoryMutationInput) {
    const existing = await this.db.inventory.findUnique({
      where: { standId_productId: { standId: input.standId, productId: input.productId } },
    });
    if (existing) {
      return this.updateInventory(input);
    }
    return this.createInventory(input);
  }

  async recordDelivery(input: {
    user: SessionUser;
    standId: string;
    productId: string;
    quantity: number;
    note?: string;
  }) {
    return this.updateInventory({
      user: input.user,
      standId: input.standId,
      productId: input.productId,
      quantityDelta: input.quantity,
      nextDeliveryAt: null,
      note: input.note ?? "Delivery recorded by staff/admin.",
      eventType: InventoryEventType.DELIVERY,
    });
  }

  private assertCanMutateInventory(user: SessionUser, producerId: string) {
    if (user.role === "platform_admin") {
      return;
    }

    if (!["producer_admin", "staff"].includes(user.role)) {
      throw new ApiError("FORBIDDEN", "Rolle darf Bestand nicht aendern.", 403, { role: user.role });
    }

    if (user.producerId !== producerId) {
      throw new ApiError("FORBIDDEN", "Inventory gehoert nicht zum erlaubten Produzenten.", 403);
    }
  }

  private toDto(
    inventory: Prisma.InventoryGetPayload<{
      include: {
        product: true;
        stand: true;
      };
    }>,
  ) {
    return {
      id: inventory.id,
      standId: inventory.standId,
      standName: inventory.stand.name,
      productId: inventory.productId,
      productName: inventory.product.name,
      unit: inventory.product.unit,
      stockQuantity: Number(inventory.stockQuantity),
      reservedQuantity: Number(inventory.reservedQuantity),
      safetyBuffer: Number(inventory.safetyBuffer),
      lowStockThreshold: Number(inventory.lowStockThreshold),
      availableQuantity: inventoryService.calculateAvailableQuantity({
        stockQuantity: Number(inventory.stockQuantity),
        reservedQuantity: Number(inventory.reservedQuantity),
        safetyBuffer: Number(inventory.safetyBuffer),
        lowStockThreshold: Number(inventory.lowStockThreshold),
      }),
      status: inventory.status.toLowerCase(),
      nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
      updatedByUserId: inventory.updatedByUserId,
    };
  }
}

export const inventoryMutationService = new InventoryMutationService();
