"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle, Loader2, ScanLine } from "lucide-react";
import Link from "next/link";

type StaffScanFormProps = {
  initialToken?: string;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message: string;
  };
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

export function StaffScanForm({ initialToken = "" }: StaffScanFormProps) {
  const [standId, setStandId] = useState("stand_mannheim_ost");
  const [token, setToken] = useState(initialToken);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
        body: JSON.stringify({ standId, token }),
      });
      const payload = (await response.json()) as ApiEnvelope<ScanResult>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "QRToken konnte nicht geprueft werden.");
      }

      setResult(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "QRToken konnte nicht geprueft werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submitScan}>
      <ScanLine size={32} aria-hidden="true" />
      <label className="form-row">
        Stand
        <input className="input" onChange={(event) => setStandId(event.target.value)} value={standId} />
      </label>
      <label className="form-row">
        QRToken
        <input className="input" onChange={(event) => setToken(event.target.value)} value={token} />
      </label>
      {error ? (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {result ? (
        <div className="notice info">
          <span>
            {result.order.orderNumber} geprueft. Token {result.tokenHashPreview}.
          </span>
          <Link href={`/staff/orders/${result.order.id}`}>Order öffnen</Link>
        </div>
      ) : null}
      <button className="button primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        Bestellung pruefen
      </button>
    </form>
  );
}
