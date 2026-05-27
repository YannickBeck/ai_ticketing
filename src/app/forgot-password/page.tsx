import { LeafyGreen } from "lucide-react";
import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = { title: "Passwort zurücksetzen – Spargelstand" };

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
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
          <h1 style={{ margin: 0, fontSize: 22 }}>Passwort vergessen?</h1>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
