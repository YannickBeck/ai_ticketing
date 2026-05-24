import { ApiError } from "@/server/api/http";
import type { PaymentStatus, SessionUser } from "@/server/domain/types";
import type { PaymentRepository } from "@/server/repositories/PaymentRepository";
import Stripe from "stripe";

export type PaymentProviderEvent = {
  provider: "stripe";
  providerEventId: string;
  providerPaymentId?: string;
  status: PaymentStatus;
  orderId?: string;
};

export type PaymentIntentOrder = {
  id: string;
  orderNumber: string;
  totalAmountCents: number;
  serviceFeeCents: number;
  currency: "EUR";
  connectedAccountId?: string;
  providerPaymentId?: string;
};

export type StripePaymentEventResult = {
  provider: "stripe";
  providerEventId: string;
  providerPaymentId?: string;
  status?: PaymentStatus;
  orderId?: string;
  rawType: string;
  handled: boolean;
};

export class PaymentService {
  constructor(private readonly repository?: PaymentRepository) {}

  calculateServiceFeeCents() {
    return 99;
  }

  async createPaymentIntentForOrder(orderId: string, user: SessionUser) {
    const repository = await this.getRepository();
    const order = await repository.getOrderForPaymentIntent(orderId, user);

    if (!this.isStripeConfigured()) {
      return this.createPaymentIntent(order);
    }

    await repository.ensurePendingPayment(order);

    if (order.providerPaymentId) {
      return this.retrievePaymentIntent(order, order.providerPaymentId);
    }

    const result = await this.createPaymentIntent(order, {
      idempotencyKey: this.buildPaymentIntentIdempotencyKey(order),
    });

    if (result.status === "pending" && result.paymentIntentId) {
      await repository.recordPaymentIntentCreated(order, result.paymentIntentId);
    }

    return result;
  }

  async createPaymentIntent(order: PaymentIntentOrder, options?: { idempotencyKey?: string }) {
    if (!order.id) {
      throw new ApiError("VALIDATION_ERROR", "Order ID fehlt.", 400);
    }

    if (!this.isStripeConfigured()) {
      return {
        orderId: order.id,
        provider: "stripe" as const,
        status: "requires_configuration" as const,
        clientSecret: null,
        amountTotalCents: order.totalAmountCents,
        serviceFeeCents: order.serviceFeeCents,
        configurationRequired: ["STRIPE_SECRET_KEY", "STRIPE_CONNECTED_ACCOUNT_ID"],
      };
    }

    if (!order.connectedAccountId) {
      throw new ApiError("VALIDATION_ERROR", "Stripe Connected Account ID fehlt fuer Produzenten.", 400);
    }

    const stripe = this.createStripeClient();
    const requestOptions = options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined;
    const paymentIntent = await stripe.paymentIntents.create(this.buildPaymentIntentParams(order), requestOptions);

    return {
      orderId: order.id,
      provider: "stripe" as const,
      status: "pending" as const,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amountTotalCents: order.totalAmountCents,
      serviceFeeCents: order.serviceFeeCents,
    };
  }

  async retrievePaymentIntent(order: PaymentIntentOrder, paymentIntentId: string) {
    const paymentIntent = await this.createStripeClient().paymentIntents.retrieve(paymentIntentId);

    return {
      orderId: order.id,
      provider: "stripe" as const,
      status: "pending" as const,
      paymentIntentId: paymentIntent.id,
      providerStatus: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      amountTotalCents: order.totalAmountCents,
      serviceFeeCents: order.serviceFeeCents,
      reused: true,
    };
  }

  async handleStripeWebhook(rawBody: string, signature: string | null) {
    if (!signature) {
      throw new ApiError("FORBIDDEN", "Stripe-Signatur fehlt.", 403);
    }

    const event = this.constructWebhookEvent(rawBody, signature);
    const mappedEvent = this.mapStripeEvent(event);
    const repository = await this.getRepository();
    const processingResult = await repository.processStripePaymentEvent(mappedEvent);

    return {
      received: true,
      event: mappedEvent,
      idempotencyKey: mappedEvent.providerEventId,
      processingResult,
    };
  }

  constructWebhookEvent(rawBody: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret === "whsec_replace") {
      throw new ApiError("VALIDATION_ERROR", "STRIPE_WEBHOOK_SECRET ist nicht konfiguriert.", 500);
    }

    try {
      return this.createStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe Webhook-Signatur ungueltig.";
      throw new ApiError("FORBIDDEN", message, 400);
    }
  }

  mapStripeEvent(event: Stripe.Event): StripePaymentEventResult {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return this.mapPaymentIntentEvent(event, paymentIntent, "succeeded");
      }
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return this.mapPaymentIntentEvent(event, paymentIntent, "failed");
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        return {
          provider: "stripe",
          providerEventId: event.id,
          providerPaymentId: paymentIntentId,
          status: "refunded",
          orderId: typeof charge.metadata?.orderId === "string" ? charge.metadata.orderId : undefined,
          rawType: event.type,
          handled: true,
        };
      }
      default:
        return {
          provider: "stripe",
          providerEventId: event.id,
          rawType: event.type,
          handled: false,
        };
    }
  }

  buildPaymentIntentParams(order: PaymentIntentOrder) {
    if (!order.connectedAccountId) {
      throw new ApiError("VALIDATION_ERROR", "Stripe Connected Account ID fehlt fuer Produzenten.", 400);
    }

    return {
      amount: order.totalAmountCents,
      currency: order.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: order.serviceFeeCents,
      transfer_data: {
        destination: order.connectedAccountId,
      },
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      description: `Spargelstand Bestellung ${order.orderNumber}`,
    } satisfies Stripe.PaymentIntentCreateParams;
  }

  buildPaymentIntentIdempotencyKey(order: PaymentIntentOrder) {
    return `order:${order.id}:payment-intent:v1`;
  }

  private mapPaymentIntentEvent(
    event: Stripe.Event,
    paymentIntent: Stripe.PaymentIntent,
    status: PaymentStatus,
  ): StripePaymentEventResult {
    return {
      provider: "stripe",
      providerEventId: event.id,
      providerPaymentId: paymentIntent.id,
      status,
      orderId: paymentIntent.metadata.orderId,
      rawType: event.type,
      handled: true,
    };
  }

  private isStripeConfigured() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    return Boolean(secretKey && secretKey !== "sk_test_replace");
  }

  private createStripeClient() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey || secretKey === "sk_test_replace") {
      throw new ApiError("VALIDATION_ERROR", "STRIPE_SECRET_KEY ist nicht konfiguriert.", 500);
    }

    return new Stripe(secretKey);
  }

  private async getRepository() {
    if (this.repository) {
      return this.repository;
    }

    const { paymentRepository } = await import("@/server/repositories/PaymentRepository");
    return paymentRepository;
  }
}

export const paymentService = new PaymentService();
