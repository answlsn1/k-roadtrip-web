import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-side client for public read-only data (anon key + RLS).
 *  Returns null when env vars are absent so local builds and preview
 *  environments degrade gracefully instead of crashing. */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
