"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StandStatus = "open" | "closed" | "seasonal_pause";

type Props = {
  standId: string;
  initialName: string;
  initialPublicNote: string;
  initialStatus: StandStatus;
};

const STATUS_LABELS: Record<StandStatus, string> = {
  open: "Geöffnet",
  closed: "Geschlossen",
  seasonal_pause: "Saisonpause",
};

export function StandEditForm({ standId, initialName, initialPublicNote, initialStatus }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [publicNote, setPublicNote] = useState(initialPublicNote);
  const [status, setStatus] = useState<StandStatus>(initialStatus);
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
        body: JSON.stringify({ name, publicNote: publicNote || null, status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: { message?: string } })?.error?.message ?? `Fehler ${res.status}`);
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
        <p className="muted" style={{ color: "var(--accent)" }}>
          Stand erfolgreich gespeichert.
        </p>
      )}
      {error && (
        <p className="muted" style={{ color: "var(--danger)" }}>
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
        Status
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value as StandStatus)}
        >
          {(Object.keys(STATUS_LABELS) as StandStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
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
