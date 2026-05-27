"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle, Camera, Keyboard, Loader2, ScanLine } from "lucide-react";
import Link from "next/link";

import { CameraScanner } from "@/components/staff/CameraScanner";

type Stand = { id: string; name: string };

type StaffScanFormProps = {
  initialToken?: string;
  stands: Stand[];
};

type ApiEnvelope<T> = {
  data?: T;
  error?: { message: string };
};

type ScanResult = {
  valid: boolean;
  standId: string;
  tokenHashPreview: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
  };
};

export function StaffScanForm({ initialToken = "", stands }: StaffScanFormProps) {
  const [standId, setStandId] = useState(stands[0]?.id ?? "");
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);

  async function doScan(scanToken: string) {
    if (!scanToken || !standId) return;
    setIsSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/v1/staff/scan", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-demo-role": "staff",
        },
        body: JSON.stringify({ standId, token: scanToken }),
      });
      const payload = (await response.json()) as ApiEnvelope<ScanResult>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "QRToken konnte nicht geprueft werden.");
      }

      setResult(payload.data);
      setCameraMode(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "QRToken konnte nicht geprueft werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await doScan(token);
  }

  function handleTokenDetected(detectedToken: string) {
    setToken(detectedToken);
    doScan(detectedToken);
  }

  return (
    <div className="stack">
      {/* Stand-Auswahl */}
      <div className="card stack">
        <label className="form-row">
          Stand
          {stands.length > 0 ? (
            <select
              className="input"
              value={standId}
              onChange={(e) => setStandId(e.target.value)}
            >
              {stands.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              value={standId}
              onChange={(e) => setStandId(e.target.value)}
              placeholder="Stand-ID eingeben"
            />
          )}
        </label>
      </div>

      {/* Modus-Toggle */}
      <div className="toolbar">
        <button
          type="button"
          className={`button ${cameraMode ? "secondary" : "primary"}`}
          onClick={() => setCameraMode(false)}
        >
          <Keyboard size={16} aria-hidden="true" />
          Manuell
        </button>
        <button
          type="button"
          className={`button ${cameraMode ? "primary" : "secondary"}`}
          onClick={() => setCameraMode(true)}
        >
          <Camera size={16} aria-hidden="true" />
          Kamera
        </button>
      </div>

      {/* Kamera-Modus */}
      {cameraMode ? (
        <div className="card stack">
          <CameraScanner onTokenDetected={handleTokenDetected} />
        </div>
      ) : (
        /* Manuelle Eingabe */
        <form className="card stack" onSubmit={submitScan}>
          <ScanLine size={32} aria-hidden="true" />
          <label className="form-row">
            QR-Token
            <input
              className="input"
              onChange={(e) => setToken(e.target.value)}
              value={token}
              placeholder="Token aus QR-Code einfügen"
            />
          </label>
          <button className="button primary" disabled={isSubmitting || !standId} type="submit">
            {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
            Bestellung prüfen
          </button>
        </form>
      )}

      {/* Ergebnis / Fehler */}
      {error ? (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {result ? (
        <div className="notice info">
          <span>
            {result.order.orderNumber} geprüft. Token {result.tokenHashPreview}.
          </span>
          <Link href={`/staff/orders/${result.order.id}`}>Order öffnen</Link>
        </div>
      ) : null}
    </div>
  );
}
