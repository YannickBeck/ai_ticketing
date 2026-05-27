import { InventoryTable } from "@/components/admin/InventoryTable";
import { getCurrentUser } from "@/server/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const user = await getCurrentUser();
  const producerId = user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Bestand</h1>
      </header>
      <InventoryTable producerId={producerId} />
    </>
  );
}
