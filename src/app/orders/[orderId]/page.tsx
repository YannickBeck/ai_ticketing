import Link from "next/link";

import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { reservationService } from "@/server/services/ReservationService";

type PageProps = { params: Promise<{ orderId: string }> };

export default async function OrderPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = await reservationService.getOrder(orderId);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Bestellung</span>
        <h1>{order.orderNumber}</h1>
        <p className="lead">
          {new Date(order.pickupSlotStart).toLocaleString("de-DE")} bis{" "}
          {new Date(order.pickupSlotEnd).toLocaleTimeString("de-DE", { timeStyle: "short" })}
        </p>
        <StatusBadge status={order.status} />
      </header>
      <section className="grid two">
        <article className="card stack">
          <h2>Summe</h2>
          <p className="metric-value">
            <Money cents={order.totalAmountCents} />
          </p>
          <p className="muted">Service Fee: <Money cents={order.serviceFeeCents} /></p>
        </article>
        <article className="card stack">
          <h2>Abholung</h2>
          <Link className="button primary" href={`/orders/${order.id}/qr`}>
            QR-Code anzeigen
          </Link>
        </article>
      </section>
    </>
  );
}
