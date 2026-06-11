import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Browser-side Supabase singleton.
 * Sessions persist in localStorage; OAuth PKCE codes in the URL
 * are exchanged automatically (detectSessionInUrl defaults to true). */
let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
