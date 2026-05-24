import { describe, expect, it } from "vitest";

import { inventoryService } from "@/server/services/InventoryService";

describe("InventoryService", () => {
  it("calculates available quantity with reserved stock and safety buffer", () => {
    expect(
      inventoryService.calculateAvailableQuantity({
        stockQuantity: 30,
        reservedQuantity: 8,
        safetyBuffer: 3,
        lowStockThreshold: 5,
      }),
    ).toBe(19);
  });

  it("marks low stock when available quantity is below threshold", () => {
    expect(
      inventoryService.calculateStatus({
        stockQuantity: 10,
        reservedQuantity: 6,
        safetyBuffer: 1,
        lowStockThreshold: 5,
      }),
    ).toBe("low_stock");
  });

  it("blocks overbooking", () => {
    expect(() =>
      inventoryService.assertReservable(
        {
          stockQuantity: 10,
          reservedQuantity: 8,
          safetyBuffer: 1,
          lowStockThreshold: 5,
        },
        2,
      ),
    ).toThrow("Gewuenschte Menge");
  });

  it("blocks manually out-of-stock inventory even when quantity is positive", () => {
    expect(() =>
      inventoryService.assertReservable(
        {
          stockQuantity: 20,
          reservedQuantity: 0,
          safetyBuffer: 0,
          lowStockThreshold: 5,
          manuallyOutOfStock: true,
        },
        1,
      ),
    ).toThrow("ausverkauft");
  });
});
