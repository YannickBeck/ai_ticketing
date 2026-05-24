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
  return (
    <article className="card">
      <div className="card-header">
        <div className="stack">
          <h3>{stand.name}</h3>
          <p className="muted">
            <MapPin size={15} aria-hidden="true" /> {stand.address}, {stand.city}
          </p>
        </div>
        <StatusBadge status={stand.status} />
      </div>
      <div className="toolbar">
        <span className="muted">{Math.round(stand.distanceMeters / 100) / 10} km entfernt</span>
        <Link className="button secondary" href={`https://maps.google.com/?q=${stand.latitude},${stand.longitude}`}>
          <Navigation size={16} aria-hidden="true" />
          Route
        </Link>
        <Link className="button primary" href={`/stands/${stand.id}`}>
          <ArrowRight size={16} aria-hidden="true" />
          Öffnen
        </Link>
      </div>
    </article>
  );
}
