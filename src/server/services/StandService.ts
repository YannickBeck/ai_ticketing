import {
  type Prisma,
  type PrismaClient,
  StandStatus as PrismaStandStatus,
} from "@prisma/client";

import { ApiError } from "@/server/api/http";
import { requireProducerScope } from "@/server/auth/permissions";
import { prisma } from "@/server/db/prisma";
import type { SessionUser, StandStatus } from "@/server/domain/types";
import { inventoryService } from "@/server/services/InventoryService";

type StandCreateInput = {
  producerId?: string;
  name: string;
  addressLine: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHours: Record<string, string>;
  status: StandStatus;
  publicNote?: string | null;
};

type StandPatchInput = Partial<Omit<StandCreateInput, "producerId">>;

type StandWithInventories = Prisma.StandGetPayload<{
  include: { inventories: true };
}>;

export class StandService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async searchStands(url: URL) {
    const openNow = url.searchParams.get("openNow") === "true";

    const stands = await this.db.stand.findMany({
      where: openNow ? { status: PrismaStandStatus.OPEN } : undefined,
      include: { inventories: true },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });

    return stands.map((stand) => this.toStandDto(stand));
  }

  async getStand(standId: string) {
    const stand = await this.db.stand.findUnique({
      where: { id: standId },
      include: { inventories: true },
    });

    if (!stand) {
      throw new ApiError("NOT_FOUND", "Stand wurde nicht gefunden.", 404);
    }

    return this.toStandDto(stand);
  }

  async listAdminStands(producerId?: string) {
    const stands = await this.db.stand.findMany({
      where: producerId ? { producerId } : undefined,
      include: { inventories: true },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });

    return stands.map((stand) => this.toStandDto(stand));
  }

  async getAdminStand(user: SessionUser, standId: string) {
    const stand = await this.db.stand.findUnique({
      where: { id: standId },
      include: { inventories: true },
    });

    if (!stand) {
      throw new ApiError("NOT_FOUND", "Stand wurde nicht gefunden.", 404);
    }

    requireProducerScope(user, stand.producerId);

    return this.toStandDto(stand);
  }

  async createStand(user: SessionUser, input: StandCreateInput) {
    const producerId = this.resolveWritableProducerId(user, input.producerId);

    const stand = await this.db.stand.create({
      data: {
        producerId,
        name: input.name,
        addressLine: input.addressLine,
        postalCode: input.postalCode,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
        openingHours: input.openingHours,
        status: this.toPrismaStandStatus(input.status),
        publicNote: input.publicNote ?? null,
      },
      include: { inventories: true },
    });

    return this.toStandDto(stand);
  }

  async patchStand(user: SessionUser, standId: string, input: StandPatchInput) {
    const existing = await this.db.stand.findUnique({
      where: { id: standId },
    });

    if (!existing) {
      throw new ApiError("NOT_FOUND", "Stand wurde nicht gefunden.", 404);
    }

    requireProducerScope(user, existing.producerId);

    const data: Prisma.StandUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.addressLine !== undefined) data.addressLine = input.addressLine;
    if (input.postalCode !== undefined) data.postalCode = input.postalCode;
    if (input.city !== undefined) data.city = input.city;
    if (input.latitude !== undefined) data.latitude = input.latitude;
    if (input.longitude !== undefined) data.longitude = input.longitude;
    if (input.openingHours !== undefined) data.openingHours = input.openingHours;
    if (input.status !== undefined) data.status = this.toPrismaStandStatus(input.status);
    if (input.publicNote !== undefined) data.publicNote = input.publicNote;

    const stand = await this.db.stand.update({
      where: { id: standId },
      data,
      include: { inventories: true },
    });

    return this.toStandDto(stand);
  }

  async getProductsForStand(standId: string) {
    await this.getStand(standId);

    const inventories = await this.db.inventory.findMany({
      where: { standId },
      include: { product: true },
    });

    return inventories.map((inventory) => {
      const snapshot = {
        stockQuantity: Number(inventory.stockQuantity),
        reservedQuantity: Number(inventory.reservedQuantity),
        safetyBuffer: Number(inventory.safetyBuffer),
        lowStockThreshold: Number(inventory.lowStockThreshold),
        nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
        manuallyOutOfStock: inventory.status === "OUT_OF_STOCK",
      };
      return {
        inventoryId: inventory.id,
        product: { ...inventory.product, currency: inventory.product.currency as "EUR" },
        stockQuantity: Number(inventory.stockQuantity),
        reservedQuantity: Number(inventory.reservedQuantity),
        safetyBuffer: Number(inventory.safetyBuffer),
        availableQuantity: inventoryService.calculateAvailableQuantity(snapshot),
        status: inventoryService.calculateStatus(snapshot),
        nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
      };
    });
  }

  private resolveWritableProducerId(user: SessionUser, requestedProducerId?: string) {
    if (user.role === "platform_admin") {
      if (!requestedProducerId) {
        throw new ApiError("VALIDATION_ERROR", "producerId ist fuer Plattformadmins erforderlich.", 400);
      }

      return requestedProducerId;
    }

    if (!user.producerId) {
      throw new ApiError("FORBIDDEN", "Produzenten-Scope fehlt.", 403);
    }

    if (requestedProducerId && requestedProducerId !== user.producerId) {
      throw new ApiError("FORBIDDEN", "Stand darf nur im eigenen Produzenten-Scope angelegt werden.", 403);
    }

    return user.producerId;
  }

  private getAvailabilitySummaryFromDb(stand: StandWithInventories) {
    return stand.inventories.reduce(
      (summary, inventory) => {
        const status = inventoryService.calculateStatus({
          stockQuantity: Number(inventory.stockQuantity),
          reservedQuantity: Number(inventory.reservedQuantity),
          safetyBuffer: Number(inventory.safetyBuffer),
          lowStockThreshold: Number(inventory.lowStockThreshold),
          nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
          manuallyOutOfStock: inventory.status === "OUT_OF_STOCK",
        });

        return {
          availableProducts: summary.availableProducts + (status === "available" ? 1 : 0),
          lowStockProducts: summary.lowStockProducts + (status === "low_stock" ? 1 : 0),
          outOfStockProducts:
            summary.outOfStockProducts + (status === "out_of_stock" || status === "next_delivery_expected" ? 1 : 0),
        };
      },
      { availableProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 },
    );
  }

  private toPrismaStandStatus(status: StandStatus) {
    switch (status) {
      case "open":
        return PrismaStandStatus.OPEN;
      case "closed":
        return PrismaStandStatus.CLOSED;
      case "seasonal_pause":
        return PrismaStandStatus.SEASONAL_PAUSE;
    }
  }

  private toDomainStandStatus(status: PrismaStandStatus): StandStatus {
    switch (status) {
      case PrismaStandStatus.OPEN:
        return "open";
      case PrismaStandStatus.CLOSED:
        return "closed";
      case PrismaStandStatus.SEASONAL_PAUSE:
        return "seasonal_pause";
    }
  }

  private toStandDto(stand: StandWithInventories) {
    return {
      id: stand.id,
      producerId: stand.producerId,
      name: stand.name,
      address: stand.addressLine,
      addressLine: stand.addressLine,
      postalCode: stand.postalCode,
      city: stand.city,
      latitude: Number(stand.latitude),
      longitude: Number(stand.longitude),
      openingHours: stand.openingHours,
      status: this.toDomainStandStatus(stand.status),
      distanceMeters: 0,
      publicNote: stand.publicNote ?? undefined,
      availabilitySummary: this.getAvailabilitySummaryFromDb(stand),
    };
  }
}

export const standService = new StandService();
