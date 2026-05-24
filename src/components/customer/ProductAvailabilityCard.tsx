import { ShoppingBasket } from "lucide-react";
import Link from "next/link";

import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";

type ProductAvailabilityCardProps = {
  standId: string;
  item: {
    product?: {
      id: string;
      name: string;
      unit: string;
      priceCents: number;
      currency: "EUR";
    };
    availableQuantity: number;
    status: string;
    nextDeliveryAt?: string | null;
  };
};

export function ProductAvailabilityCard({ standId, item }: ProductAvailabilityCardProps) {
  if (!item.product) {
    return null;
  }

  return (
    <article className="card">
      <div className="card-header">
        <div className="stack">
          <h3>{item.product.name}</h3>
          <p className="muted">
            <Money cents={item.product.priceCents} currency={item.product.currency} /> / {item.product.unit}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="toolbar">
        <span>{item.availableQuantity.toLocaleString("de-DE")} {item.product.unit} verfügbar</span>
        <Link className="button primary" href={`/stands/${standId}/products/${item.product.id}`}>
          <ShoppingBasket size={16} aria-hidden="true" />
          Reservieren
        </Link>
      </div>
    </article>
  );
}
