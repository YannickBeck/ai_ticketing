import { OpenOrdersList } from "@/components/staff/OpenOrdersList";
import { getCurrentUser } from "@/server/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function StaffOrdersPage() {
  const user = await getCurrentUser();
  const standId = user?.standIds?.[0] ?? null;

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Offene Bestellungen</h1>
      </header>
      {standId ? (
        <OpenOrdersList standId={standId} />
      ) : (
        <div className="card stack">
          <p className="muted">Kein Stand zugewiesen.</p>
        </div>
      )}
    </>
  );
}
