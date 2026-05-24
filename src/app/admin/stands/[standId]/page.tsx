import { standService } from "@/server/services/StandService";

type PageProps = { params: Promise<{ standId: string }> };

export default async function AdminStandDetailPage({ params }: PageProps) {
  const { standId } = await params;
  const stand = await standService.getStand(standId);

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
