import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      console.error("[supabase] NEXT_PUBLIC_SUPABASE_URL must start with https://");
      return null;
    }
  } catch {
    console.error("[supabase] NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
    return null;
  }

  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (e) {
    console.error("[supabase] createClient failed:", e);
    return null;
  }
}
