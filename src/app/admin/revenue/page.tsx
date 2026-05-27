import { Money } from "@/components/shared/Money";
import { getCurrentUser } from "@/server/auth/requireUser";
import { adminQueryService } from "@/server/services/AdminQueryService";

const fallbackRevenue = {
  totalCents: 0,
  productTotalCents: 0,
  feesTotalCents: 0,
  orderCount: 0,
};

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const user = await getCurrentUser();
  const revenue = user
    ? await adminQueryService
        .getRevenueSummary(user)
        .catch(() => fallbackRevenue)
    : fallbackRevenue;

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Umsätze</h1>
      </header>
      <section className="grid two">
        <article className="card metric">
          <span className="metric-value"><Money cents={revenue.totalCents} /></span>
          <span className="muted">Gesamtumsatz</span>
        </article>
        <article className="card metric">
          <span className="metric-value"><Money cents={revenue.feesTotalCents} /></span>
          <span className="muted">Service Fees</span>
        </article>
        <article className="card metric">
          <span className="metric-value"><Money cents={revenue.productTotalCents} /></span>
          <span className="muted">Produktumsatz</span>
        </article>
        <article className="card metric">
          <span className="metric-value">{revenue.orderCount}</span>
          <span className="muted">Bezahlte Bestellungen</span>
        </article>
      </section>
    </>
  );
}
