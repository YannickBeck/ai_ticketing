"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);

    // Auto-redirect to home after 2s — the session is active now.
    setTimeout(() => router.push("/"), 2000);
  }

  if (done) {
    return (
      <div className="auth-form stack" style={{ alignItems: "center", textAlign: "center", gap: "16px" }}>
        <CheckCircle2 size={48} color="var(--accent)" aria-hidden="true" />
        <h2 style={{ margin: 0 }}>Passwort geändert</h2>
        <p className="muted" style={{ margin: 0 }}>Du wirst gleich weitergeleitet…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="password">Neues Passwort</label>
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
      <div className="form-group">
        <label htmlFor="confirm">Passwort bestätigen</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Nochmal eingeben"
          minLength={8}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="button primary" disabled={loading}>
        {loading ? "Wird gespeichert…" : "Passwort speichern"}
      </button>
    </form>
  );
}
