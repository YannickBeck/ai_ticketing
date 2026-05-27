import { DashboardKpiGrid } from "@/components/admin/DashboardKpiGrid";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { getCurrentUser } from "@/server/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const producerId = user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Tagessteuerung</h1>
        <p className="lead">Reservierungen, kritische Bestände, Zahlungen und Notification-Probleme.</p>
      </header>
      <div className="stack">
        <DashboardKpiGrid />
        <OrdersTable producerId={producerId} />
        <InventoryTable producerId={producerId} />
      </div>
    </>
  );
}
