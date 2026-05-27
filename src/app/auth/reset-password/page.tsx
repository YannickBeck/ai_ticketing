import { LeafyGreen } from "lucide-react";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = { title: "Neues Passwort – Spargelstand" };

export default function ResetPasswordPage() {
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
          <h1 style={{ margin: 0, fontSize: 22 }}>Neues Passwort setzen</h1>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
