import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client using the service-role key.
 * Only use server-side — NEVER expose this to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
