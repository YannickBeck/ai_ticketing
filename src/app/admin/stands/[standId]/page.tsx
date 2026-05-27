import { StandEditForm } from "@/components/admin/StandEditForm";
import { getCurrentUser } from "@/server/auth/requireUser";
import { standService } from "@/server/services/StandService";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ standId: string }> };

export const dynamic = "force-dynamic";

export default async function AdminStandDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { standId } = await params;
  const result = await standService
    .getAdminStand(user, standId)
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
          <h2>Stand nicht gefunden</h2>
          <p className="muted">Der Stand existiert nicht oder du hast keinen Zugriff.</p>
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
      <StandEditForm
        standId={stand.id}
        initialName={stand.name}
        initialPublicNote={stand.publicNote ?? ""}
      />
    </>
  );
}
