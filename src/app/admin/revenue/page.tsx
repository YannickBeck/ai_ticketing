import { Money } from "@/components/shared/Money";
import { mockOrders } from "@/server/db/mockData";

export default function AdminRevenuePage() {
  const total = mockOrders.reduce((sum, order) => sum + order.totalAmountCents, 0);
  const fees = mockOrders.reduce((sum, order) => sum + order.serviceFeeCents, 0);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Umsätze</h1>
      </header>
      <section className="grid two">
        <article className="card metric">
          <span className="metric-value"><Money cents={total} /></span>
          <span className="muted">Gesamtumsatz</span>
        </article>
        <article className="card metric">
          <span className="metric-value"><Money cents={fees} /></span>
          <span className="muted">Service Fees</span>
        </article>
      </section>
    </>
  );
}
