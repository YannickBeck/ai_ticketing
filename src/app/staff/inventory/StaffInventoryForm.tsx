"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle, Loader2, PackagePlus } from "lucide-react";

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message: string;
  };
};

type InventoryResponse = {
  productName: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  status: string;
};

export function StaffInventoryForm() {
  const [standId, setStandId] = useState("stand_mannheim_ost");
  const [productId, setProductId] = useState("prod_spargel_klasse_1");
  const [stockQuantity, setStockQuantity] = useState("30");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitInventory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/v1/staff/inventory", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-demo-role": "staff",
        },
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

  return (
    <form className="card stack" onSubmit={submitInventory}>
      <PackagePlus size={24} aria-hidden="true" />
      <label className="form-row">
        Stand
        <input className="input" onChange={(event) => setStandId(event.target.value)} value={standId} />
      </label>
      <label className="form-row">
        Produkt
        <select className="input" onChange={(event) => setProductId(event.target.value)} value={productId}>
          <option value="prod_spargel_klasse_1">Spargel Klasse I</option>
          <option value="prod_erdbeeren_schale">Erdbeeren</option>
        </select>
      </label>
      <label className="form-row">
        Neuer Bestand
        <input
          className="input"
          min="0"
          onChange={(event) => setStockQuantity(event.target.value)}
          step="0.1"
          type="number"
          value={stockQuantity}
        />
      </label>
      <label className="form-row">
        Notiz
        <input className="input" onChange={(event) => setNote(event.target.value)} value={note} />
      </label>
      {error ? (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {result ? (
        <div className="notice info">
          {result.productName}: Bestand {result.stockQuantity}, verfuegbar {result.availableQuantity}, Status{" "}
          {result.status}
        </div>
      ) : null}
      <button className="button primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        Bestand speichern
      </button>
    </form>
  );
}
