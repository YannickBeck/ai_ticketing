"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  standId: string;
  initialName: string;
  initialPublicNote: string;
};

export function StandEditForm({ standId, initialName, initialPublicNote }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [publicNote, setPublicNote] = useState(initialPublicNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/v1/admin/stands/${standId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, publicNote: publicNote || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `Fehler ${res.status}`);
      }

      setSuccess(true);
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
          Stand erfolgreich gespeichert.
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </label>
      <label className="form-row">
        Öffentliche Notiz
        <input
          className="input"
          value={publicNote}
          onChange={(e) => setPublicNote(e.target.value)}
          placeholder="Keine Notiz"
        />
      </label>
      <button className="button primary" type="submit" disabled={loading}>
        {loading ? "Wird gespeichert…" : "Speichern"}
      </button>
    </form>
  );
}
