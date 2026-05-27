import Link from "next/link";

import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { reservationService } from "@/server/services/ReservationService";

export async function OrdersTable({ producerId = "producer_sonnenhof" }: { producerId?: string }) {
  const result = await reservationService
    .listAdminOrders(producerId)
    .then((orders) => ({ orders, failed: false }))
    .catch(() => ({ orders: [], failed: true }));

  if (result.failed) {
    return (
      <div className="card stack">
        <h2>Reservierungen nicht geladen</h2>
        <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Bestellnr.</th>
            <th>Stand</th>
            <th>Abholzeit</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </tr>
        </thead>
        <tbody>
          {result.orders.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px 0" }}>
                Noch keine Reservierungen vorhanden.
              </td>
            </tr>
          ) : null}
          {result.orders.map((order) => (
            <tr key={order.id} className="table-row-link">
              <td>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="table-link"
                >
                  {order.orderNumber}
                </Link>
              </td>
              <td>{order.standName}</td>
              <td>
                {new Date(order.pickupSlotStart).toLocaleTimeString("de-DE", { timeStyle: "short" })}
              </td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td style={{ textAlign: "right" }}>
                <Money cents={order.totalAmountCents} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
