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
  availableQuantity: number;
  status: string;
};

export function StaffDeliveryForm() {
  const [standId, setStandId] = useState("stand_mannheim_ost");
  const [productId, setProductId] = useState("prod_spargel_klasse_1");
  const [quantity, setQuantity] = useState("10");
  const [note, setNote] = useState("Lieferung eingetroffen");
  const [result, setResult] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/v1/staff/deliveries", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-demo-role": "staff",
        },
        body: JSON.stringify({
          standId,
          productId,
          quantity: Number(quantity),
          note: note || undefined,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<InventoryResponse>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Lieferung konnte nicht gebucht werden.");
      }

      setResult(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Lieferung konnte nicht gebucht werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submitDelivery}>
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
        Menge
        <input
          className="input"
          min="0.1"
          onChange={(event) => setQuantity(event.target.value)}
          step="0.1"
          type="number"
          value={quantity}
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
        Lieferung buchen
      </button>
    </form>
  );
}
