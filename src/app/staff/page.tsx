import { OpenOrdersList } from "@/components/staff/OpenOrdersList";
import { StaffHomeActions } from "@/components/staff/StaffHomeActions";
import { getCurrentUser } from "@/server/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await getCurrentUser();
  // Staff users have standIds from their assignments; platform_admin sees all (no filter)
  const standId = user?.standIds?.[0] ?? null;

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>Standbetrieb</h1>
      </header>
      <div className="stack">
        <StaffHomeActions />
        {standId ? (
          <OpenOrdersList standId={standId} />
        ) : (
          <article className="card stack">
            <h3>Kein Stand zugewiesen</h3>
            <p className="muted">Dein Konto ist noch keinem Stand zugewiesen. Bitte wende dich an den Administrator.</p>
          </article>
        )}
      </div>
    </>
  );
}
