import { ArrowRight, Bell, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { StandCard } from "@/components/customer/StandCard";
import { mockStands } from "@/server/db/mockData";

export default function HomePage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">MVP Pilot</span>
        <h1>Reservieren, bezahlen, am Stand per QR-Code abholen.</h1>
        <p className="lead">
          Lokale Verkaufsstände mit verbindlicher Verfügbarkeit, digitalem Checkout und optionalen WhatsApp Updates.
        </p>
        <div className="toolbar">
          <Link className="button primary" href="/stands">
            <ArrowRight size={16} aria-hidden="true" />
            Stände anzeigen
          </Link>
          <Link className="button secondary" href="/admin">
            Admin öffnen
          </Link>
        </div>
      </header>

      <section className="split">
        <div className="grid">
          {mockStands.map((stand) => (
            <StandCard stand={stand} key={stand.id} />
          ))}
        </div>

        <aside className="grid">
          <article className="card stack">
            <ShieldCheck size={22} aria-hidden="true" />
            <h2>Reservierungsgarantie</h2>
            <p className="muted">Bestand wird waehrend Checkout geblockt und bei Pickup final fortgeschrieben.</p>
          </article>
          <article className="card stack">
            <PackageCheck size={22} aria-hidden="true" />
            <h2>Staff Flow</h2>
            <p className="muted">Offene Orders, QR-Scan, Fallback-Code und Bestandsupdate sind getrennt vom Adminbereich.</p>
          </article>
          <article className="card stack">
            <Bell size={22} aria-hidden="true" />
            <h2>WhatsApp P1</h2>
            <p className="muted">Opt-in, Bestellbestaetigung, Abholerinnerung und QR-Link sind als Pilotkanal vorbereitet.</p>
          </article>
        </aside>
      </section>
    </>
  );
}
