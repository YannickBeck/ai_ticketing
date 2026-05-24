import { StandCard } from "@/components/customer/StandCard";
import { mockStands } from "@/server/db/mockData";

export default function StandsPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Customer</span>
        <h1>Stände in der Nähe</h1>
        <p className="lead">Sortiert nach Entfernung mit Öffnungsstatus und Reservierungsfähigkeit.</p>
      </header>
      <section className="grid two">
        {mockStands.map((stand) => (
          <StandCard stand={stand} key={stand.id} />
        ))}
      </section>
    </>
  );
}
