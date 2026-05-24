"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AlertCircle, Loader2, PackageCheck } from "lucide-react";

type StaffPickupFormProps = {
  orderId: string;
  standId: string;
  orderNumber: string;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message: string;
  };
};

export function StaffPickupForm({ orderId, standId, orderNumber }: StaffPickupFormProps) {
  const router = useRouter();
  const [code, setCode] = useState(orderNumber);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitPickup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/v1/staff/orders/${encodeURIComponent(orderId)}/pickup`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-demo-role": "staff",
        },
        body: JSON.stringify({
          standId,
          token: token || undefined,
          orderNumber: token ? undefined : code,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<{ status: string; pickedUpAt?: string | null }>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Abholung konnte nicht bestaetigt werden.");
      }

      setMessage("Abholung bestaetigt.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Abholung konnte nicht bestaetigt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submitPickup}>
      <PackageCheck size={24} aria-hidden="true" />
      <h2>Abholung</h2>
      <label className="form-row">
        QRToken
        <input className="input" onChange={(event) => setToken(event.target.value)} value={token} />
      </label>
      <label className="form-row">
        Fallback-Code
        <input className="input" onChange={(event) => setCode(event.target.value.toUpperCase())} value={code} />
      </label>
      {message ? <p className="notice info">{message}</p> : null}
      {error ? (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      <button className="button primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        Abholung bestaetigen
      </button>
    </form>
  );
}
