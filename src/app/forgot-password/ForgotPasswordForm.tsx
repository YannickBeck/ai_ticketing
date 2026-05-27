"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    // Route through /auth/callback so the server exchanges the PKCE code,
    // then redirects to /auth/reset-password where the user sets a new password.
    const callbackUrl = `${window.location.origin}/auth/callback?redirect_to=/auth/reset-password`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="auth-form stack" style={{ alignItems: "center", textAlign: "center", gap: "16px" }}>
        <CheckCircle2 size={48} color="var(--accent)" aria-hidden="true" />
        <h2 style={{ margin: 0 }}>E-Mail gesendet</h2>
        <p className="muted" style={{ margin: 0 }}>
          Falls ein Konto mit <strong>{email}</strong> existiert, erhältst du in Kürze einen Link zum Zurücksetzen.
        </p>
        <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
          Kein Link erhalten? Prüfe auch den Spam-Ordner.
        </p>
        <a href="/login" className="button secondary" style={{ alignSelf: "center" }}>
          Zurück zum Login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <p className="muted" style={{ margin: 0 }}>
        Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen des Passworts.
      </p>
      <div className="form-group">
        <label htmlFor="email">E-Mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="name@beispiel.de"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="button primary" disabled={loading}>
        {loading ? "Wird gesendet…" : "Link anfordern"}
      </button>
      <p className="auth-link">
        <a href="/login">Zurück zum Login</a>
      </p>
    </form>
  );
}
