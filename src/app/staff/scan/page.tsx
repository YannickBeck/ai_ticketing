import { StaffScanForm } from "@/app/staff/scan/StaffScanForm";
import { getCurrentUser } from "@/server/auth/requireUser";
import { standService } from "@/server/services/StandService";

type PageProps = { searchParams: Promise<{ token?: string }> };

export const dynamic = "force-dynamic";

export default async function StaffScanPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const user = await getCurrentUser();

  const stands = user
    ? await standService
        .listAdminStands(user.role === "platform_admin" ? undefined : user.producerId)
        .then((s) => s.map((x) => ({ id: x.id, name: x.name })))
        .catch(() => [])
    : [];

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Staff</span>
        <h1>QR scannen</h1>
      </header>
      <StaffScanForm initialToken={token} stands={stands} />
    </>
  );
}
