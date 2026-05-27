import { StandCard } from "@/components/customer/StandCard";
import { getCurrentUser } from "@/server/auth/requireUser";
import { standService } from "@/server/services/StandService";

export const dynamic = "force-dynamic";

export default async function AdminStandsPage() {
  const user = await getCurrentUser();
  const producerId = user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  const result = await standService
    .listAdminStands(producerId)
    .then((items) => ({ items, failed: false }))
    .catch(() => ({ items: [], failed: true }));

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Stände</h1>
      </header>
      {result.failed ? (
        <div className="card stack">
          <h2>Stände nicht geladen</h2>
          <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
        </div>
      ) : null}
      <section className="grid two">
        {result.items.map((stand) => (
          <StandCard stand={stand} key={stand.id} />
        ))}
      </section>
    </>
  );
}
