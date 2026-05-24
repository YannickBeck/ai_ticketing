"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { AlertCircle, Loader2, ShoppingBasket } from "lucide-react";

import { Money } from "@/components/shared/Money";

type ReservationFormProps = {
  standId: string;
  productId: string;
  productName: string;
  unit: string;
  priceCents: number;
  pickupSlots: Array<{
    label: string;
    start: string;
    end: string;
  }>;
};

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    message: string;
  };
};

type OrderResponse = {
  id?: string;
  orderId?: string;
};

export function ReservationForm({
  standId,
  productId,
  productName,
  unit,
  priceCents,
  pickupSlots,
}: ReservationFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(pickupSlots[0]?.start ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSlot = pickupSlots.find((slot) => slot.start === selectedSlot) ?? pickupSlots[0];
  const totalCents = useMemo(() => Math.round(quantity * priceCents), [priceCents, quantity]);

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeSlot) {
      setError("Bitte ein Abholfenster waehlen.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          standId,
          pickupSlotStart: activeSlot.start,
          pickupSlotEnd: activeSlot.end,
          items: [
            {
              productId,
              quantity,
            },
          ],
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<OrderResponse>;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Reservierung konnte nicht angelegt werden.");
      }

      const orderId = payload.data.id ?? payload.data.orderId;

      if (!orderId) {
        throw new Error("API-Antwort enthaelt keine Order-ID.");
      }

      router.push(`/checkout/${encodeURIComponent(orderId)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Reservierung konnte nicht angelegt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={submitReservation}>
      <div className="card-header">
        <h2>Auswahl</h2>
        <ShoppingBasket size={22} aria-hidden="true" />
      </div>
      <label className="form-row">
        Menge
        <input
          className="input"
          min="0.1"
          name="quantity"
          onChange={(event) => setQuantity(Number(event.target.value))}
          step="0.1"
          type="number"
          value={quantity}
        />
      </label>
      <label className="form-row">
        Abholzeitfenster
        <select className="input" onChange={(event) => setSelectedSlot(event.target.value)} value={selectedSlot}>
          {pickupSlots.map((slot) => (
            <option key={slot.start} value={slot.start}>
              {slot.label}
            </option>
          ))}
        </select>
      </label>
      <div className="payment-summary">
        <span>{productName}</span>
        <span>
          {quantity.toLocaleString("de-DE")} {unit}
        </span>
        <span>
          <Money cents={totalCents} />
        </span>
      </div>
      {error ? (
        <div className="notice error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      <button className="button primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="spin" size={18} aria-hidden="true" /> : null}
        Reservierung anlegen
      </button>
    </form>
  );
}
