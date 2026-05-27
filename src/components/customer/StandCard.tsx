import { ArrowRight, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";

export type StandCardData = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: string;
  distanceMeters: number;
};

export function StandCard({ stand }: { stand: StandCardData }) {
  const isOpen = stand.status === "open";
  const distanceKm = Math.round(stand.distanceMeters / 100) / 10;

  return (
    <article
      className="card"
      style={{
        borderTop: isOpen ? "3px solid var(--accent)" : "3px solid var(--border)",
        paddingTop: 17,
      }}
    >
      <div className="card-header" style={{ alignItems: "flex-start", marginBottom: 14 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h3 style={{ fontSize: 17 }}>{stand.name}</h3>
          <p
            className="muted"
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, margin: 0 }}
          >
            <MapPin size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
            {stand.address}, {stand.city}
          </p>
        </div>
        <StatusBadge status={stand.status} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span className="muted" style={{ fontSize: 13 }}>
          {distanceKm} km entfernt
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            className="button secondary"
            href={`https://maps.google.com/?q=${stand.latitude},${stand.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={14} aria-hidden="true" />
            Route
          </Link>
          <Link className="button primary" href={`/stands/${stand.id}`}>
            <ArrowRight size={14} aria-hidden="true" />
            Zum Stand
          </Link>
        </div>
      </div>
    </article>
  );
}
