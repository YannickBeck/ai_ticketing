import { demoUsers } from "@/server/auth/permissions";
import { standService } from "@/server/services/StandService";

type PageProps = { params: Promise<{ standId: string }> };

export default async function AdminStandDetailPage({ params }: PageProps) {
  const { standId } = await params;
  const result = await standService
    .getAdminStand(demoUsers.producer_admin, standId)
    .then((stand) => ({ stand, failed: false }))
    .catch(() => ({ stand: null, failed: true }));

  if (result.failed || !result.stand) {
    return (
      <>
        <header className="page-header">
          <span className="eyebrow">Admin Stand</span>
          <h1>Stand nicht geladen</h1>
        </header>
        <div className="card stack">
          <h2>Datenbank nicht erreichbar</h2>
          <p className="muted">Der Stand kann erst nach Migration und Seed angezeigt werden.</p>
        </div>
      </>
    );
  }

  const stand = result.stand;

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin Stand</span>
        <h1>{stand.name}</h1>
      </header>
      <form className="card stack">
        <label className="form-row">
          Name
          <input className="input" defaultValue={stand.name} />
        </label>
        <label className="form-row">
          Öffentliche Notiz
          <input className="input" defaultValue={stand.publicNote ?? ""} />
        </label>
        <button className="button primary" type="button">
          Speichern
        </button>
      </form>
    </>
  );
}
