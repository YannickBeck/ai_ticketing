"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export type InventoryItem = {
  id: string;
  standId: string;
  standName: string;
  productId: string;
  productName: string;
  unit: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  safetyBuffer: number;
  lowStockThreshold: number;
  status: string;
  nextDeliveryAt: string | null;
};

type RowState = {
  stockQuantity: string;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

export function InventoryEditor({ items }: { items: InventoryItem[] }) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      items.map((item) => [
        item.id,
        {
          stockQuantity: String(item.stockQuantity),
          saving: false,
          saved: false,
          error: null,
        },
      ])
    )
  );

  function setRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function save(item: InventoryItem) {
    const row = rows[item.id];
    const newQty = parseFloat(row.stockQuantity.replace(",", "."));
    if (isNaN(newQty) || newQty < 0) {
      setRow(item.id, { error: "Ungültige Menge." });
      return;
    }

    setRow(item.id, { saving: true, error: null, saved: false });

    try {
      const res = await fetch(`/api/v1/admin/inventory/${item.standId}/${item.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newQty }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? "Fehler beim Speichern.");
      }

      setRow(item.id, { saving: false, saved: true });
      setTimeout(() => setRow(item.id, { saved: false }), 3000);
    } catch (e) {
      setRow(item.id, {
        saving: false,
        error: e instanceof Error ? e.message : "Fehler beim Speichern.",
      });
    }
  }

  if (items.length === 0) {
    return (
      <div className="card stack" style={{ textAlign: "center", padding: "2.5rem", gap: 8 }}>
        <p style={{ fontWeight: 600 }}>Noch keine Produkte angelegt</p>
        <p className="muted">Legen Sie zuerst Stände und Produkte an, damit hier Bestände eingetragen werden können.</p>
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
            <th>Bestand eintragen</th>
            <th>Reserviert</th>
            <th>Verfügbar</th>
            <th>Status</th>
            <th style={{ width: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const row = rows[item.id];
            const currentQty = parseFloat(row.stockQuantity.replace(",", "."));
            const isDirty = !isNaN(currentQty) && currentQty !== item.stockQuantity;

            return (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.standName}</td>
                <td>{item.productName}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={row.stockQuantity}
                      onChange={(e) =>
                        setRow(item.id, { stockQuantity: e.target.value, saved: false, error: null })
                      }
                      onKeyDown={(e) => e.key === "Enter" && isDirty && save(item)}
                      style={{
                        width: 90,
                        padding: "5px 8px",
                        border: isDirty
                          ? "2px solid var(--accent)"
                          : "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: isDirty ? 600 : 400,
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                    <span className="muted" style={{ fontSize: 13 }}>{item.unit}</span>
                  </div>
                  {row.error && (
                    <p style={{ color: "var(--danger)", fontSize: 12, margin: "4px 0 0" }}>
                      {row.error}
                    </p>
                  )}
                </td>
                <td className="muted">
                  {item.reservedQuantity} {item.unit}
                </td>
                <td style={{ fontWeight: 500 }}>
                  {item.availableQuantity} {item.unit}
                </td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  {row.saved ? (
                    <span
                      style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}
                    >
                      ✓ Gespeichert
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      disabled={!isDirty || row.saving}
                      onClick={() => save(item)}
                      style={{ padding: "5px 14px", fontSize: 13, opacity: isDirty ? 1 : 0.4 }}
                    >
                      {row.saving ? "…" : "Speichern"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
