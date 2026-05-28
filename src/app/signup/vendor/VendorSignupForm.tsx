"use client";

import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useState } from "react";

type Step = 1 | 2;

type FormData = {
  name: string;
  email: string;
  password: string;
  producerName: string;
  standName: string;
  addressLine: string;
  postalCode: string;
  city: string;
};

const empty: FormData = {
  name: "",
  email: "",
  password: "",
  producerName: "",
  standName: "",
  addressLine: "",
  postalCode: "",
  city: "",
};

export function VendorSignupForm() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Use standName = producerName if left blank
    const payload = {
      ...form,
      standName: form.standName.trim() || form.producerName.trim(),
    };

    const res = await fetch("/api/v1/vendor/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as { success?: true; error?: string };
    setLoading(false);

    if (!res.ok || json.error) {
      setError(json.error ?? "Registrierung fehlgeschlagen.");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="auth-form stack" style={{ alignItems: "center", textAlign: "center", gap: 16 }}>
        <CheckCircle2 size={48} color="var(--accent)" aria-hidden="true" />
        <h2 style={{ margin: 0 }}>Registrierung eingegangen!</h2>
        <p className="muted" style={{ margin: 0 }}>
          Dein Konto ist aktiv. Du kannst dich jetzt anmelden — dein Stand ist zunächst
          deaktiviert und wird nach kurzer Prüfung freigeschaltet.
        </p>
        <a href="/login" className="button primary" style={{ marginTop: 8 }}>
          Jetzt anmelden
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {([1, 2] as Step[]).map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              background: s <= step ? "var(--accent)" : "var(--border)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1} className="auth-form">
          <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>
            Schritt 1 von 2 — Persönliche Daten
          </p>

          <div className="form-group">
            <label htmlFor="name">Vollständiger Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set("name")}
              required
              minLength={2}
              autoComplete="name"
              placeholder="Max Mustermann"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              autoComplete="email"
              placeholder="max@meinhof.de"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
            />
          </div>

          <button type="submit" className="button primary">
            Weiter →
          </button>

          <p className="auth-link">
            Bereits ein Konto? <a href="/login">Anmelden</a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleStep2} className="auth-form">
          <p className="muted" style={{ margin: "0 0 16px", fontSize: 13 }}>
            Schritt 2 von 2 — Standinformationen
          </p>

          <div className="form-group">
            <label htmlFor="producerName">Firmenname / Betrieb</label>
            <input
              id="producerName"
              type="text"
              value={form.producerName}
              onChange={set("producerName")}
              required
              minLength={2}
              placeholder="Spargelhof Müller GbR"
            />
          </div>

          <div className="form-group">
            <label htmlFor="standName">
              Standname{" "}
              <span className="muted" style={{ fontSize: 12 }}>
                (optional, Standard = Firmenname)
              </span>
            </label>
            <input
              id="standName"
              type="text"
              value={form.standName}
              onChange={set("standName")}
              placeholder="z. B. Spargel-Stand Heidelberg Marktplatz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="addressLine">Straße &amp; Hausnummer</label>
            <input
              id="addressLine"
              type="text"
              value={form.addressLine}
              onChange={set("addressLine")}
              required
              minLength={3}
              autoComplete="street-address"
              placeholder="Musterstraße 12"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="postalCode">PLZ</label>
              <input
                id="postalCode"
                type="text"
                value={form.postalCode}
                onChange={set("postalCode")}
                required
                minLength={4}
                maxLength={10}
                autoComplete="postal-code"
                placeholder="68165"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="city">Stadt</label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={set("city")}
                required
                minLength={2}
                autoComplete="address-level2"
                placeholder="Mannheim"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="button secondary"
              style={{ flex: "0 0 auto" }}
              onClick={() => { setError(null); setStep(1); }}
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
            <button type="submit" className="button primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? "Wird registriert…" : "Händler-Konto erstellen"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
