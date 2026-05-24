import { InventoryTable } from "@/components/admin/InventoryTable";

export const dynamic = "force-dynamic";

export default function AdminInventoryPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Bestand</h1>
      </header>
      <InventoryTable />
    </>
  );
}
