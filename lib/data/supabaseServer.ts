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
    return createClient(url, key, {
      auth: { persistSession: false },
      // supabase-js's internal fetch isn't reliably caught by Next's per-request
      // cache patching on Vercel — force-dynamic on the page alone left this
      // client's reads served from a stale snapshot (confirmed: sitemap.xml and
      // the homepage silently missed every route published after a deploy,
      // while direct per-slug lookups and a local reproduction of this same
      // query both returned fresh data). Explicit no-store removes the ambiguity.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
  } catch (e) {
    console.error("[supabase] createClient failed:", e);
    return null;
  }
}
