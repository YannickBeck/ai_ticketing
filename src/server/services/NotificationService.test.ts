import { describe, expect, it } from "vitest";

import { NotificationService } from "@/server/services/NotificationService";

const event = {
  type: "order.confirmed" as const,
  orderId: "order_demo_1",
  userId: "user_customer_demo",
  occurredAt: new Date("2026-05-24T08:00:00.000Z"),
};

describe("NotificationService", () => {
  it("does not create WhatsApp plan without opt-in", () => {
    const service = new NotificationService();
    const plans = service.buildPlans(event, {
      id: "user_customer_demo",
      email: "kunde@example.local",
      phoneNumber: "+491701234567",
      whatsappOptIn: false,
    });

    expect(plans.map((plan) => plan.channel)).toEqual(["email"]);
  });

  it("adds WhatsApp plan when opt-in and phone number exist", () => {
    const service = new NotificationService();
    const plans = service.buildPlans(event, {
      id: "user_customer_demo",
      email: "kunde@example.local",
      phoneNumber: "+491701234567",
      whatsappOptIn: true,
    });

    expect(plans.map((plan) => plan.channel)).toEqual(["email", "whatsapp"]);
  });
});
