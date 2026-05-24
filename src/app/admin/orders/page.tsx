import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Reservierungen</h1>
      </header>
      <OrdersTable />
    </>
  );
}
