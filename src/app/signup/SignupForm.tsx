"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // After clicking the confirmation link, Supabase redirects here.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // session === null means email confirmation is required.
    // (If confirmation is disabled in Supabase settings, session is non-null
    //  and we could redirect directly — but we always ask to confirm.)
    if (!data.session) {
      setConfirmed(true);
      setLoading(false);
      return;
    }

    // Email confirmation is disabled in Supabase — session is immediately active.
    window.location.href = "/";
  }

  if (confirmed) {
    return (
      <div className="auth-form stack" style={{ alignItems: "center", textAlign: "center", gap: "16px" }}>
        <CheckCircle2 size={48} color="var(--accent)" aria-hidden="true" />
        <h2 style={{ margin: 0 }}>Fast geschafft!</h2>
        <p className="muted" style={{ margin: 0 }}>
          Wir haben eine Bestätigungsmail an <strong>{email}</strong> gesendet.
          Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
        </p>
        <p className="muted" style={{ fontSize: "13px", margin: 0 }}>
          Kein Link erhalten? Prüfe auch den Spam-Ordner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Max Mustermann"
        />
      </div>
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
      <div className="form-group">
        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Mindestens 8 Zeichen"
          minLength={8}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="button primary" disabled={loading}>
        {loading ? "Konto wird erstellt…" : "Konto erstellen"}
      </button>
      <p className="auth-link">
        Bereits ein Konto? <a href="/login">Anmelden</a>
      </p>
    </form>
  );
}
