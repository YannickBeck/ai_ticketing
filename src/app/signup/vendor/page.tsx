import { LeafyGreen } from "lucide-react";
import Link from "next/link";
import { VendorSignupForm } from "./VendorSignupForm";

export const metadata = { title: "Als Händler registrieren – Spargelstand" };

export default function VendorSignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/" aria-label="Zur Startseite">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "var(--accent)",
              }}
            >
              <LeafyGreen size={26} style={{ color: "#fff" }} />
            </div>
          </Link>
          <h1 style={{ margin: 0, fontSize: 22 }}>Als Händler registrieren</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14, textAlign: "center" }}>
            Eröffne deinen Spargelstand und nimm Reservierungen an
          </p>
        </div>

        <VendorSignupForm />

        <p className="auth-link" style={{ marginTop: 20, textAlign: "center" }}>
          Nur Spargel kaufen?{" "}
          <Link href="/signup">Als Kunde registrieren</Link>
        </p>
      </div>
    </div>
  );
}
