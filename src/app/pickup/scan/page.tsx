import { ScanLine } from "lucide-react";

export default function PickupScanPage() {
  return (
    <>
      <header className="page-header">
        <span className="eyebrow">Pickup</span>
        <h1>QR-Code prüfen</h1>
        <p className="lead">Staff validiert Token, Stand-Zuordnung, Order-Status und One-Time-Use serverseitig.</p>
      </header>
      <section className="card stack">
        <ScanLine size={32} aria-hidden="true" />
        <label className="form-row">
          Token oder Fallback-Code
          <input className="input" placeholder="A7K4Q2" />
        </label>
        <button className="button primary" type="button">
          Prüfen
        </button>
      </section>
    </>
  );
}
