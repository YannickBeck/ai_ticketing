import { StatusBadge } from "@/components/shared/StatusBadge";
import { inventoryMutationService } from "@/server/services/InventoryMutationService";

export async function InventoryTable({ producerId }: { producerId?: string }) {
  const result = await inventoryMutationService
    .listInventory(producerId)
    .then((items) => ({ items, failed: false }))
    .catch(() => ({ items: [], failed: true }));

  if (result.failed) {
    return (
      <div className="card stack">
        <h2>Bestand nicht geladen</h2>
        <p className="muted">Die Datenbank ist nicht erreichbar oder noch nicht migriert.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Stand</th>
            <th>Produkt</th>
            <th>Bestand</th>
            <th>Reserviert</th>
            <th>Verfügbar</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {result.items.length === 0 ? (
            <tr>
              <td colSpan={6}>Noch keine Bestandsdaten vorhanden.</td>
            </tr>
          ) : null}
          {result.items.map((inventory) => (
            <tr key={inventory.id}>
              <td>{inventory.standName}</td>
              <td>{inventory.productName}</td>
              <td>{inventory.stockQuantity}</td>
              <td>{inventory.reservedQuantity}</td>
              <td>{inventory.availableQuantity}</td>
              <td>
                <StatusBadge status={inventory.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
