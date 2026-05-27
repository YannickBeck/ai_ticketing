"use client";

import { AlertCircle, Loader2, PackagePlus } from "lucide-react";
import { type FormEvent, useState } from "react";

type StandOption = {
  id: string;
  name: string;
  products: { id: string; name: string }[];
};

type ApiEnvelope<T> = {
  data?: T;
  error?: { message: string };
};

type InventoryResponse = {
  productName: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  status: string;
};

export function StaffInventoryForm({ stands }: { stands: StandOption[] }) {
  const [standId, setStandId] = useState(stands[0]?.id ?? "");
  const [productId, setProductId] = useState(stands[0]?.products[0]?.id ?? "");
  const [stockQuantity, setStockQuantity] = useState("30");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStand = stands.find((s) => s.id === standId);
  const products = selectedStand?.products ?? [];

  function handleStandChange(newStandId: string) {
    setStandId(newStandId);
    const newStand = stands.find((s) => s.id === newStandId);
    setProductId(newStand?.products[0]?.id ?? "");
  }

  async function submitInventory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/v1/staff/inventory", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          standId,
          productId,
          stockQuantity: Number(stockQuantity),
          note: note || undefined,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<InventoryResponse>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Bestand konnte nicht gespeichert werden.");
      }

      setResult(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Bestand konnte nicht gespeichert werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (stands.length === 0) {
    return (
      <div className="card stack">
        <p className="muted">Kein Stand zugewiesen. Bitte wende dich an den Administrator.</p>
      </div>
    );
  }

  return (
    <form className="card stack" onSubmit={submitInventory}>
      <PackagePlus size={24} aria-hidden="true" />

      <label className="form-row">
        Stand
        <select className="input" value={standId} onChange={(e) => handleStandChange(e.target.value)}>
          {stands.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="form-row">
        Produkt
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {products.length === 0 ? (
            <option value="">Keine Produkte verfügbar</option>
          ) : (
            products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))
          )}
        </select>
      </label>

      <label className="form-row">
        Neuer Bestand
        <input
          className="input"
          min="0"
          onChange={(e) => setStockQuantity(e.target.value)}
          step="0.1"
          type="number"
          value={stockQuantity}
        />
      </label>

      <label className="form-row">
        Notiz
        <input className="input" onChange={(e) => setNote(e.target.value)} value={note} />
      </label>

      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="notice info">
          <strong>{result.productName}</strong>: Bestand {result.stockQuantity}, verfügbar{" "}
          {result.availableQuantity}, Status {result.status}
        </div>
      )}

      <button className="button primary" disabled={isSubmitting || !productId} type="submit">
        {isSubmitting && <Loader2 className="spin" size={18} aria-hidden="true" />}
        Bestand speichern
      </button>
    </form>
  );
}
