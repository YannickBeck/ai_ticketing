import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { PaymentService } from "@/server/services/PaymentService";

const order = {
  id: "order_demo_1",
  orderNumber: "A7K4Q2",
  totalAmountCents: 2499,
  serviceFeeCents: 99,
  currency: "EUR" as const,
  connectedAccountId: "acct_test_connected",
};

describe("PaymentService", () => {
  it("builds Stripe Connect PaymentIntent params with application fee and destination", () => {
    const service = new PaymentService();
    const params = service.buildPaymentIntentParams(order);

    expect(params).toMatchObject({
      amount: 2499,
      currency: "eur",
      application_fee_amount: 99,
      transfer_data: {
        destination: "acct_test_connected",
      },
      metadata: {
        orderId: "order_demo_1",
        orderNumber: "A7K4Q2",
      },
    });
  });

  it("builds deterministic idempotency keys per order", () => {
    const service = new PaymentService();

    expect(service.buildPaymentIntentIdempotencyKey(order)).toBe("order:order_demo_1:payment-intent:v1");
  });

  it("maps payment_intent.succeeded to succeeded status", () => {
    const service = new PaymentService();
    const event = {
      id: "evt_test",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test",
          metadata: {
            orderId: "order_demo_1",
          },
        },
      },
    } as unknown as Stripe.Event;

    expect(service.mapStripeEvent(event)).toMatchObject({
      provider: "stripe",
      providerEventId: "evt_test",
      providerPaymentId: "pi_test",
      status: "succeeded",
      orderId: "order_demo_1",
      handled: true,
    });
  });

  it("keeps unknown Stripe events idempotent but unhandled", () => {
    const service = new PaymentService();
    const event = {
      id: "evt_unknown",
      type: "customer.created",
      data: {
        object: {},
      },
    } as unknown as Stripe.Event;

    expect(service.mapStripeEvent(event)).toMatchObject({
      providerEventId: "evt_unknown",
      handled: false,
    });
  });
});
