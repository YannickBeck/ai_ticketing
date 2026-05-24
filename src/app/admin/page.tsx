import { DashboardKpiGrid } from "@/components/admin/DashboardKpiGrid";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default function AdminDashboardPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Tagessteuerung</h1>
        <p className="lead">Reservierungen, kritische Bestände, Zahlungen und Notification-Probleme.</p>
      </header>
      <div className="stack">
        <DashboardKpiGrid />
        <OrdersTable />
        <InventoryTable />
      </div>
    </>
  );
}
