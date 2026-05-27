"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Stand = { id: string; name: string };

export function StaffCreateForm({ stands }: { stands: Stand[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [standId, setStandId] = useState(stands[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, standId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `Fehler ${res.status}`);
      }

      setSuccess(true);
      setEmail("");
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      {success && (
        <p className="muted" style={{ color: "green" }}>
          Mitarbeiter erfolgreich angelegt.
        </p>
      )}
      {error && (
        <p className="muted" style={{ color: "red" }}>
          {error}
        </p>
      )}
      <label className="form-row">
        Name
        <input
          className="input"
          placeholder="Max Mustermann"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </label>
      <label className="form-row">
        E-Mail
        <input
          className="input"
          type="email"
          placeholder="staff@example.local"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="form-row">
        Stand
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
      <button className="button primary" type="submit" disabled={loading}>
        {loading ? "Wird angelegt…" : "Mitarbeiter anlegen"}
      </button>
    </form>
  );
}
