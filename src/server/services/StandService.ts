import { ApiError, parseSearchNumber } from "@/server/api/http";
import { mockInventory, mockProducts, mockStands } from "@/server/db/mockData";
import { inventoryService } from "@/server/services/InventoryService";

export class StandService {
  async searchStands(url: URL) {
    const radius = parseSearchNumber(url.searchParams.get("radius"), 15000);
    const openNow = url.searchParams.get("openNow") === "true";

    return mockStands
      .filter((stand) => stand.distanceMeters <= radius)
      .filter((stand) => (openNow ? stand.status === "open" : true))
      .map((stand) => ({
        ...stand,
        availabilitySummary: this.getAvailabilitySummary(stand.id),
      }));
  }

  async getStand(standId: string) {
    const stand = mockStands.find((item) => item.id === standId);

    if (!stand) {
      throw new ApiError("NOT_FOUND", "Stand wurde nicht gefunden.", 404);
    }

    return {
      ...stand,
      openingHours: {
        monday: "08:00-18:00",
        saturday: "08:00-14:00",
      },
      availabilitySummary: this.getAvailabilitySummary(stand.id),
    };
  }

  getAvailabilitySummary(standId: string) {
    const inventories = mockInventory.filter((item) => item.standId === standId);

    return inventories.reduce(
      (summary, item) => {
        const status = inventoryService.calculateStatus(item);
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

  async getProductsForStand(standId: string) {
    await this.getStand(standId);

    return mockInventory
      .filter((inventory) => inventory.standId === standId)
      .map((inventory) => {
        const product = mockProducts.find((item) => item.id === inventory.productId);
        return {
          inventoryId: inventory.id,
          product,
          stockQuantity: inventory.stockQuantity,
          reservedQuantity: inventory.reservedQuantity,
          safetyBuffer: inventory.safetyBuffer,
          availableQuantity: inventoryService.calculateAvailableQuantity(inventory),
          status: inventoryService.calculateStatus(inventory),
          nextDeliveryAt: inventory.nextDeliveryAt,
        };
      });
  }
}

export const standService = new StandService();
