import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE-ROLE key (bypasses RLS).
 * Used solely to read aggregate metrics for the founder dashboard.
 *
 * ⚠️ NEVER import this into a client component — the service-role key must
 * never reach the browser. The key is read from SUPABASE_SERVICE_ROLE_KEY
 * (NOT NEXT_PUBLIC_*). Returns null if the secret is unset (graceful).
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}
