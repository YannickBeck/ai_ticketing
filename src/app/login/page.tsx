import { LeafyGreen } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden – Spargelstand" };

export default function LoginPage() {
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
          <h1 style={{ margin: 0, fontSize: 22 }}>Anmelden</h1>
          <p className="muted" style={{ margin: 0, fontSize: 14, textAlign: "center" }}>
            Willkommen zurück bei Spargelstand
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
