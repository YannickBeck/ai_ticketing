import { StaffCreateForm } from "@/components/admin/StaffCreateForm";
import { getCurrentUser } from "@/server/auth/requireUser";
import { standService } from "@/server/services/StandService";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const user = await getCurrentUser();
  const allStands = user
    ? await standService
        .listAdminStands(user.role === "platform_admin" ? undefined : user.producerId)
        .catch(() => [])
    : [];

  const stands = allStands.map((s) => ({ id: s.id, name: s.name }));

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Mitarbeiter</h1>
      </header>
      <StaffCreateForm stands={stands} />
    </>
  );
}
