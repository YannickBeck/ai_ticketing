import { mockInventory } from "@/server/db/mockData";
import { inventoryService } from "@/server/services/InventoryService";

export class DeliveryPlanningService {
  async getSuggestions() {
    return mockInventory
      .map((inventory) => ({
        standId: inventory.standId,
        productId: inventory.productId,
        availableQuantity: inventoryService.calculateAvailableQuantity(inventory),
        status: inventoryService.calculateStatus(inventory),
        recommendedQuantity: Math.max(0, inventory.lowStockThreshold + inventory.safetyBuffer - inventory.stockQuantity),
      }))
      .filter((item) => item.status !== "available");
  }
}

export const deliveryPlanningService = new DeliveryPlanningService();
