import { InventoryEditor } from "@/components/admin/InventoryEditor";
import { getCurrentUser } from "@/server/auth/requireUser";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const user = await getCurrentUser();
  const producerId =
    user?.role === "platform_admin" ? undefined : (user?.producerId ?? undefined);

  const items = await inventoryMutationService.listInventory(producerId).catch(() => []);

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Bestand verwalten</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Tragen Sie hier ein, wie viel von jedem Produkt aktuell vorrätig ist.
          Geänderte Werte werden mit{" "}
          <strong>Enter</strong> oder dem <strong>Speichern</strong>-Button übernommen.
        </p>
      </header>
      <InventoryEditor items={items} />
    </>
  );
}
