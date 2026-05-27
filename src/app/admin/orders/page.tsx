import { OrdersTable } from "@/components/admin/OrdersTable";
import { getCurrentUser } from "@/server/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  const producerId = user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Reservierungen</h1>
      </header>
      <OrdersTable producerId={producerId} />
    </>
  );
}
