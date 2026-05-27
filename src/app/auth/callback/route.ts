import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Supabase email-confirmation callback.
 * Supabase redirects here after the user clicks the confirmation link:
 *   GET /auth/callback?code=<pkce-code>&redirect_to=<optional>
 *
 * We exchange the one-time code for a session, then send the user
 * to the destination (default: home).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect_to") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Expired or already-used link — send to login with a hint.
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("error", "link_expired");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to the intended destination (or home).
  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
