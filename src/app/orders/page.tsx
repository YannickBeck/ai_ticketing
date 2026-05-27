import Link from "next/link";

import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getCurrentUser } from "@/server/auth/requireUser";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <header className="page-header">
          <span className="eyebrow">Konto</span>
          <h1>Meine Bestellungen</h1>
        </header>
        <div className="card stack">
          <p className="muted">
            Bitte <Link href="/login" className="table-link">anmelden</Link>, um Bestellungen zu sehen.
          </p>
        </div>
      </>
    );
  }

  const orders = await prisma.order
    .findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        stand: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    })
    .catch(() => null);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Konto</span>
        <h1>Meine Bestellungen</h1>
      </header>

      {orders === null ? (
        <div className="card stack">
          <p className="muted">Bestellungen konnten nicht geladen werden.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card stack">
          <p className="muted">Noch keine Bestellungen vorhanden.</p>
          <Link href="/" className="button primary" style={{ alignSelf: "flex-start" }}>
            Stände entdecken
          </Link>
        </div>
      ) : (
        <section className="stack" style={{ gap: "12px" }}>
          {orders.map((order) => {
            const pickupDate = new Date(order.pickupSlotStart).toLocaleDateString("de-DE", {
              weekday: "short",
              day: "numeric",
              month: "long",
            });
            const pickupTime = new Date(order.pickupSlotStart).toLocaleTimeString("de-DE", {
              timeStyle: "short",
            });
            const productNames = order.items
              .map((i) => `${Number(i.quantity).toLocaleString("de-DE")} ${i.unit} ${i.product.name}`)
              .join(", ");

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                style={{ textDecoration: "none" }}
              >
                <article className="card" style={{ padding: "16px 20px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div className="stack" style={{ gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 600, fontSize: "15px" }}>
                          #{order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
                        {order.stand.name} · {pickupDate}, {pickupTime} Uhr
                      </p>
                      <p style={{ fontSize: "13px", margin: 0, color: "var(--text)" }}>
                        {productNames}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, fontSize: "15px" }}>
                        <Money cents={order.totalAmountCents} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}
