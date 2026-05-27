import { ArrowRight, CheckCircle, Clock, QrCode } from "lucide-react";
import Link from "next/link";

import { StandCard } from "@/components/customer/StandCard";
import { standService } from "@/server/services/StandService";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const url = new URL("http://localhost/stands?openNow=true");
  const stands = await standService.searchStands(url).catch(() => []);

  return (
    <>
      {/* Hero */}
      <header className="page-header">
        <span className="eyebrow">Frischer Spargel aus der Region</span>
        <h1>Reservieren, bezahlen&nbsp;&amp; entspannt abholen.</h1>
        <p className="lead">
          Sicher dir deinen Spargel, bevor er ausverkauft ist — direkt beim lokalen Stand
          vorab reservieren und per QR-Code abholen.
        </p>
        <div className="toolbar">
          <Link className="button primary" href="/stands">
            <ArrowRight size={16} aria-hidden="true" />
            Stände anzeigen
          </Link>
          <Link className="button secondary" href="/orders">
            Meine Bestellungen
          </Link>
        </div>
      </header>

      {/* Stand listing + benefits sidebar */}
      <section className="split">
        <div>
          {stands.length > 0 ? (
            <div className="grid">
              {stands.map((stand) => (
                <StandCard stand={stand} key={stand.id} />
              ))}
            </div>
          ) : (
            <div className="card stack" style={{ textAlign: "center", padding: "40px 24px" }}>
              <p className="muted">Aktuell sind keine Stände geöffnet.</p>
              <Link className="button primary" href="/stands" style={{ justifySelf: "center" }}>
                Alle Stände anzeigen
              </Link>
            </div>
          )}
        </div>

        <aside className="stack">
          <article className="card stack">
            <CheckCircle size={22} color="var(--accent)" aria-hidden="true" />
            <h2>Garantierte Verfügbarkeit</h2>
            <p className="muted">
              Dein Spargel wird beim Reservieren für dich zurückgelegt — kein Umsonst-Fahren
              mehr.
            </p>
          </article>
          <article className="card stack">
            <QrCode size={22} color="var(--accent)" aria-hidden="true" />
            <h2>Einfache Abholung</h2>
            <p className="muted">
              Zeig einfach deinen QR-Code am Stand — in Sekunden abgehakt, keine Warteschlange.
            </p>
          </article>
          <article className="card stack">
            <Clock size={22} color="var(--accent)" aria-hidden="true" />
            <h2>WhatsApp-Erinnerung</h2>
            <p className="muted">
              Wir erinnern dich rechtzeitig an deine Abholung — damit nichts vergessen wird.
            </p>
          </article>
        </aside>
      </section>
    </>
  );
}
