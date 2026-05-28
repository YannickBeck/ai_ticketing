"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Stand = { id: string; name: string };

type Props = { stands: Stand[] };

const UNITS = ["kg", "g", "Stück", "Bund", "Liter"];

export function ProductCreateForm({ stands }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("kg");
  const [priceEur, setPriceEur] = useState("");
  const [description, setDescription] = useState("");
  const [standId, setStandId] = useState(stands[0]?.id ?? "");
  const [stock, setStock] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const priceCents = Math.round(parseFloat(priceEur.replace(",", ".")) * 100);
      if (isNaN(priceCents) || priceCents < 0) throw new Error("Ungültiger Preis.");

      // 1 — Create product
      const productRes = await fetch("/api/v1/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          unit,
          priceCents,
          description: description.trim() || null,
          active: true,
        }),
      });

      if (!productRes.ok) {
        const d = await productRes.json().catch(() => ({}));
        throw new Error((d as { error?: { message?: string } })?.error?.message ?? `Fehler ${productRes.status}`);
      }

      const { data: product } = await productRes.json();

      // 2 — Set inventory for the chosen stand (if stock > 0 or stand selected)
      const stockQty = parseFloat(stock) || 0;
      if (standId && stockQty >= 0) {
        const invRes = await fetch(`/api/v1/admin/inventory/${standId}/${product.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stockQuantity: stockQty }),
        });

        if (!invRes.ok) {
          const d = await invRes.json().catch(() => ({}));
          throw new Error(
            "Produkt erstellt, aber Inventar konnte nicht gesetzt werden: " +
              ((d as { error?: { message?: string } })?.error?.message ?? `Fehler ${invRes.status}`)
          );
        }
      }

      setSuccess(true);
      // Reset form
      setName("");
      setCategory("");
      setUnit("kg");
      setPriceEur("");
      setDescription("");
      setStock("0");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  if (stands.length === 0) {
    return (
      <div className="card stack">
        <p className="muted">Kein Stand vorhanden. Bitte zuerst einen Stand anlegen.</p>
      </div>
    );
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2>Neues Produkt</h2>

      {success && (
        <p className="muted" style={{ color: "var(--accent)" }}>
          Produkt erfolgreich angelegt.
        </p>
      )}
      {error && (
        <p className="muted" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <label className="form-row">
        Name *
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Weißer Spargel"
          required
          minLength={2}
        />
      </label>

      <label className="form-row">
        Kategorie *
        <input
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="z. B. Spargel"
          required
          minLength={2}
        />
      </label>

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <label style={{ flex: 1 }}>
          Einheit *
          <select
            className="input"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: 1 }}>
          Preis (€) *
          <input
            className="input"
            type="text"
            inputMode="decimal"
            value={priceEur}
            onChange={(e) => setPriceEur(e.target.value)}
            placeholder="14,90"
            required
          />
        </label>
      </div>

      <label className="form-row">
        Beschreibung
        <input
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
      </label>

      <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
        <label style={{ flex: 2 }}>
          Stand *
          <select
            className="input"
            value={standId}
            onChange={(e) => setStandId(e.target.value)}
            required
          >
            {stands.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: 1 }}>
          Anfangsbestand
          <input
            className="input"
            type="number"
            min="0"
            step="0.5"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </label>
      </div>

      <button className="button primary" type="submit" disabled={loading}>
        {loading ? <Loader2 className="spin" size={16} aria-hidden="true" /> : null}
        {loading ? "Wird erstellt…" : "Produkt anlegen"}
      </button>
    </form>
  );
}
