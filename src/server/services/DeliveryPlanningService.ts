import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/server/db/prisma";
import { inventoryService } from "@/server/services/InventoryService";

export class DeliveryPlanningService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getSuggestions() {
    const inventories = await this.db.inventory.findMany({
      include: { product: true, stand: true },
    });

    return inventories
      .map((inventory) => {
        const snapshot = {
          stockQuantity: inventory.stockQuantity.toNumber(),
          reservedQuantity: inventory.reservedQuantity.toNumber(),
          safetyBuffer: inventory.safetyBuffer.toNumber(),
          lowStockThreshold: inventory.lowStockThreshold.toNumber(),
          nextDeliveryAt: inventory.nextDeliveryAt?.toISOString() ?? null,
        };

        return {
          standId: inventory.standId,
          productId: inventory.productId,
          availableQuantity: inventoryService.calculateAvailableQuantity(snapshot),
          status: inventoryService.calculateStatus(snapshot),
          recommendedQuantity: Math.max(
            0,
            snapshot.lowStockThreshold + snapshot.safetyBuffer - snapshot.stockQuantity,
          ),
        };
      })
      .filter((item) => item.status !== "available");
  }
}

export const deliveryPlanningService = new DeliveryPlanningService();
