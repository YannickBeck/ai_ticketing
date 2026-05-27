import { StandCard } from "@/components/customer/StandCard";
import { standService } from "@/server/services/StandService";

export const dynamic = "force-dynamic";

export default async function StandsPage() {
  const url = new URL("http://localhost/stands");
  const stands = await standService.searchStands(url).catch(() => []);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Customer</span>
        <h1>Stände in der Nähe</h1>
        <p className="lead">Sortiert nach Entfernung mit Öffnungsstatus und Reservierungsfähigkeit.</p>
      </header>
      <section className="grid two">
        {stands.map((stand) => (
          <StandCard stand={stand} key={stand.id} />
        ))}
      </section>
    </>
  );
}
