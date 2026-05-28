"use client";

import { AlertCircle, CheckCircle, Loader2, ScanLine } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ScanResult = {
  valid: boolean;
  standId: string;
  tokenHashPreview: string;
  order: { id: string; orderNumber: string; status: string };
};

type ApiEnvelope<T> = { data?: T; error?: { message: string } };

function PickupScanInner() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [standId, setStandId] = useState("");
  const [token] = useState(tokenFromUrl);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Auto-scan as soon as stand is entered (or immediately if already filled)
  async function doScan(scanStandId: string) {
    if (!token || !scanStandId) return;
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/v1/staff/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ standId: scanStandId, token }),
      });

      const payload = (await res.json()) as ApiEnvelope<ScanResult>;

      if (!res.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Token konnte nicht geprüft werden.");
      }

      setResult(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setIsSubmitting(false);
    }
  }

  // If token is in URL, prompt staff to enter their stand ID and auto-submit
  useEffect(() => {
    if (token && standId && !autoSubmitted) {
      setAutoSubmitted(true);
      doScan(standId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await doScan(standId);
  }

  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Pickup</span>
        <h1>QR-Code prüfen</h1>
        <p className="lead">
          {token
            ? "Token aus QR-Code erkannt. Stand-ID eingeben zum Validieren."
            : "Token manuell eingeben oder QR-Code am Stand scannen."}
        </p>
      </header>

      <section className="card stack">
        <ScanLine size={32} aria-hidden="true" />

        <form onSubmit={handleSubmit} className="stack">
          {token ? (
            <div className="notice info">
              <span>Token gelesen: {token.slice(0, 8)}…</span>
            </div>
          ) : null}

          <label className="form-row">
            Stand-ID
            <input
              className="input"
              placeholder="z. B. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={standId}
              onChange={(e) => setStandId(e.target.value.trim())}
              required
            />
          </label>

          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting || !standId || !token}
          >
            {isSubmitting ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : null}
            Bestellung prüfen
          </button>
        </form>

        {error ? (
          <div className="notice error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {result ? (
          <div className="notice info">
            <CheckCircle size={18} aria-hidden="true" />
            <div>
              <p>
                <strong>{result.order.orderNumber}</strong> — Status:{" "}
                {result.order.status}
              </p>
              <Link href={`/staff/orders/${result.order.id}`}>Order öffnen →</Link>
            </div>
          </div>
        ) : null}
      </section>

      <p className="muted" style={{ textAlign: "center", fontSize: "0.85rem" }}>
        Staff-Oberfläche mit Kamera-Support:{" "}
        <Link href="/staff/scan">→ /staff/scan</Link>
      </p>
    </>
  );
}

export default function PickupScanPage() {
  return (
    <Suspense>
      <PickupScanInner />
    </Suspense>
  );
}
