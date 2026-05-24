import { CreditCard } from "lucide-react";

import { CheckoutPayment } from "@/app/checkout/[orderId]/CheckoutPayment";

type PageProps = { params: Promise<{ orderId: string }> };

export default async function CheckoutPage({ params }: PageProps) {
  const { orderId } = await params;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Checkout</span>
        <h1>Zahlung starten</h1>
        <p className="lead">Order {orderId}</p>
      </header>
      <section className="card stack">
        <CreditCard size={24} aria-hidden="true" />
        <h2>Stripe Payment Element</h2>
        <p className="muted">Erzeugt einen Stripe PaymentIntent und rendert anschliessend das Payment Element.</p>
        <CheckoutPayment orderId={orderId} publishableKey={publishableKey} />
      </section>
    </>
  );
}
