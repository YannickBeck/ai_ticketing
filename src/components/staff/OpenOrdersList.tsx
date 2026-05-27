import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { reservationService } from "@/server/services/ReservationService";

export async function OpenOrdersList({ standId }: { standId: string }) {
  const result = await reservationService
    .listStaffOrders(standId)
    .then((orders) => ({ orders, failed: false }))
    .catch(() => ({ orders: [], failed: true }));

  if (result.failed) {
    return (
      <section className="grid">
        <article className="card stack">
          <h3>Orders nicht geladen</h3>
          <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="grid">
      {result.orders.length === 0 ? (
        <article className="card stack">
          <h3>Keine offenen Orders</h3>
          <p className="muted">Sobald bestätigte Bestellungen vorliegen, erscheinen sie hier.</p>
        </article>
      ) : null}
      {result.orders.map((order) => (
        <article className="card" key={order.id}>
          <div className="card-header">
            <div className="stack">
              <h3>{order.orderNumber}</h3>
              <p className="muted">
                {new Date(order.pickupSlotStart).toLocaleTimeString("de-DE", { timeStyle: "short" })} bis{" "}
                {new Date(order.pickupSlotEnd).toLocaleTimeString("de-DE", { timeStyle: "short" })}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <Link className="button primary" href={`/staff/orders/${order.id}`}>
            Öffnen
          </Link>
        </article>
      ))}
    </section>
  );
}
