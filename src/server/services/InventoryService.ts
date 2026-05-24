import { ApiError } from "@/server/api/http";
import type { InventorySnapshot, InventoryStatus } from "@/server/domain/types";

export class InventoryService {
  calculateAvailableQuantity(snapshot: InventorySnapshot) {
    return snapshot.stockQuantity - snapshot.reservedQuantity - snapshot.safetyBuffer;
  }

  calculateStatus(snapshot: InventorySnapshot): InventoryStatus {
    const availableQuantity = this.calculateAvailableQuantity(snapshot);

    if (snapshot.manuallyOutOfStock || availableQuantity <= 0) {
      return snapshot.nextDeliveryAt ? "next_delivery_expected" : "out_of_stock";
    }

    if (availableQuantity <= snapshot.lowStockThreshold) {
      return snapshot.nextDeliveryAt ? "next_delivery_expected" : "low_stock";
    }

    return "available";
  }

  assertReservable(snapshot: InventorySnapshot, requestedQuantity: number) {
    if (requestedQuantity <= 0) {
      throw new ApiError("VALIDATION_ERROR", "Reservierungsmenge muss positiv sein.", 400);
    }

    if (snapshot.manuallyOutOfStock) {
      throw new ApiError("INSUFFICIENT_INVENTORY", "Produkt ist aktuell als ausverkauft markiert.", 409);
    }

    const availableQuantity = this.calculateAvailableQuantity(snapshot);

    if (requestedQuantity > availableQuantity) {
      throw new ApiError("INSUFFICIENT_INVENTORY", "Gewuenschte Menge ist nicht verfuegbar.", 409, {
        requestedQuantity,
        availableQuantity,
      });
    }
  }

  createReservationHold(snapshot: InventorySnapshot, requestedQuantity: number) {
    this.assertReservable(snapshot, requestedQuantity);

    const nextSnapshot: InventorySnapshot = {
      ...snapshot,
      reservedQuantity: snapshot.reservedQuantity + requestedQuantity,
    };

    return {
      snapshot: nextSnapshot,
      status: this.calculateStatus(nextSnapshot),
      eventType: "reservation_hold" as const,
    };
  }

  finalizePickup(snapshot: InventorySnapshot, pickedUpQuantity: number) {
    if (pickedUpQuantity <= 0) {
      throw new ApiError("VALIDATION_ERROR", "Abholmenge muss positiv sein.", 400);
    }

    return {
      snapshot: {
        ...snapshot,
        stockQuantity: Math.max(0, snapshot.stockQuantity - pickedUpQuantity),
        reservedQuantity: Math.max(0, snapshot.reservedQuantity - pickedUpQuantity),
      },
      eventType: "pickup" as const,
    };
  }
}

export const inventoryService = new InventoryService();
