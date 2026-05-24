"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

type PaymentIntentData = {
  orderId: string;
  provider: "stripe";
  status: "pending" | "requires_configuration";
  paymentIntentId?: string;
  clientSecret: string | null;
  amountTotalCents: number;
  serviceFeeCents: number;
  configurationRequired?: string[];
};

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type CheckoutPaymentProps = {
  orderId: string;
  publishableKey: string;
};

export function CheckoutPayment({ orderId, publishableKey }: CheckoutPaymentProps) {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentData | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stripePromise = useMemo(() => {
    if (!isConfiguredPublishableKey(publishableKey)) {
      return null;
    }

    return loadStripe(publishableKey);
  }, [publishableKey]);

  const elementsOptions = useMemo<StripeElementsOptions | null>(() => {
    if (!paymentIntent?.clientSecret) {
      return null;
    }

    return {
      clientSecret: paymentIntent.clientSecret,
      appearance: {
        theme: "stripe",
      },
    };
  }, [paymentIntent?.clientSecret]);

  async function preparePayment() {
    setIsPreparing(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/v1/orders/${encodeURIComponent(orderId)}/payment-intent`, {
        method: "POST",
      });
      const payload = (await response.json()) as ApiEnvelope<PaymentIntentData>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Zahlung konnte nicht vorbereitet werden.");
      }

      setPaymentIntent(payload.data);

      if (payload.data.status === "requires_configuration") {
        const missing = payload.data.configurationRequired?.join(", ") ?? "Stripe-Konfiguration";
        setMessage(`${missing} fehlt noch. Die lokale Stripe-Integration ist installiert, aber nicht konfiguriert.`);
        return;
      }

      if (!isConfiguredPublishableKey(publishableKey)) {
        setMessage("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY fehlt noch. PaymentIntent wurde erstellt, Element kann nicht rendern.");
        return;
      }

      setMessage("PaymentIntent erstellt. Zahlungsformular ist bereit.");
    } catch (caught) {
      const nextError = caught instanceof Error ? caught.message : "Zahlung konnte nicht vorbereitet werden.";
      setError(nextError);
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <button className="button primary" type="button" onClick={preparePayment} disabled={isPreparing}>
          {isPreparing ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
          Zahlung vorbereiten
        </button>
        {paymentIntent ? (
          <span className={`status ${paymentIntent.status === "pending" ? "pending" : "failed"}`}>
            {paymentIntent.status === "pending" ? "pending" : "Konfiguration fehlt"}
          </span>
        ) : null}
      </div>

      {paymentIntent ? (
        <div className="payment-summary">
          <span>Gesamt: {formatMoney(paymentIntent.amountTotalCents)}</span>
          <span>Service Fee: {formatMoney(paymentIntent.serviceFeeCents)}</span>
          {paymentIntent.paymentIntentId ? <span>Intent: {paymentIntent.paymentIntentId}</span> : null}
        </div>
      ) : null}

      {message ? <InlineNotice tone="info" message={message} /> : null}
      {error ? <InlineNotice tone="error" message={error} /> : null}

      {stripePromise && elementsOptions ? (
        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripePaymentForm orderId={orderId} />
        </Elements>
      ) : null}
    </div>
  );
}

function StripePaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe ist noch nicht bereit.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${encodeURIComponent(orderId)}`,
      },
    });

    if (result.error) {
      setError(result.error.message ?? "Zahlung wurde von Stripe abgelehnt.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="stack payment-element" onSubmit={submitPayment}>
      <PaymentElement />
      {error ? <InlineNotice tone="error" message={error} /> : null}
      <button className="button primary" type="submit" disabled={!stripe || !elements || isSubmitting}>
        {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        Zahlung abschliessen
      </button>
    </form>
  );
}

function InlineNotice({ tone, message }: { tone: "info" | "error"; message: string }) {
  const Icon = tone === "info" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`notice ${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function isConfiguredPublishableKey(value: string) {
  return Boolean(value && value !== "pk_test_replace");
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amountCents / 100);
}
