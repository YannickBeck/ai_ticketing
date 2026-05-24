import { describe, expect, it } from "vitest";

import { QRCodeService } from "@/server/services/QRCodeService";

describe("QRCodeService", () => {
  it("rebuilds stored order pickup tokens from token id and nonce", () => {
    const service = new QRCodeService();
    const pickupSlotEnd = new Date("2026-05-24T12:00:00.000Z");
    const created = service.createOrderPickupToken("order_demo_1", pickupSlotEnd);

    const rebuilt = service.buildStoredOrderPickupToken({
      tokenId: created.tokenId,
      tokenNonce: created.tokenNonce,
      orderId: "order_demo_1",
      expiresAt: created.expiresAt,
    });

    expect(rebuilt.token).toBe(created.token);
    expect(rebuilt.tokenHash).toBe(created.tokenHash);
    expect(rebuilt.qrLink).toBe(created.qrLink);
  });
});
