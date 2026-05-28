"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function WhatsAppOptIn() {
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current preferences on mount
  useEffect(() => {
    fetch("/api/v1/me/notification-preferences")
      .then((r) => r.json())
      .then((envelope) => {
        const data = envelope?.data;
        if (data?.phoneNumber) setPhone(data.phoneNumber);
        if (typeof data?.whatsappOptIn === "boolean") setOptIn(data.whatsappOptIn);
      })
      .catch(() => {
        // If not logged in or error, silently skip — form still usable
      })
      .finally(() => setInitialLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/me/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "whatsapp",
          enabled: optIn,
          phoneNumber: phone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: { message?: string } })?.error?.message ?? `Fehler ${res.status}`);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <div className="card-header">
        <h3>WhatsApp Updates</h3>
        <MessageCircle size={20} aria-hidden="true" />
      </div>

      {success && (
        <p className="muted" style={{ color: "var(--accent)" }}>
          Einstellungen gespeichert.
        </p>
      )}
      {error && (
        <p className="muted" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <label className="form-row">
        Telefonnummer
        <input
          className="input"
          name="phoneNumber"
          type="tel"
          placeholder="+49 170 1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={initialLoading}
        />
      </label>

      <label className="toolbar">
        <input
          name="whatsappOptIn"
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          disabled={initialLoading}
        />
        Bestellstatus und Abholerinnerung per WhatsApp erhalten
      </label>

      <button className="button primary" type="submit" disabled={loading || initialLoading}>
        {loading ? "Wird gespeichert…" : "Speichern"}
      </button>
    </form>
  );
}
