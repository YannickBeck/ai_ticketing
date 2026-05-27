import { LeafyGreen } from "lucide-react";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Registrieren – Spargelstand" };

export default function SignupPage() {
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
          <h1 style={{ margin: 0, fontSize: 22 }}>Konto erstellen</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14, textAlign: "center" }}>
            Jetzt registrieren und Spargel reservieren
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
