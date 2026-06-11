import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/* ============================================================
 * B2G analytics — anonymous, fire-and-forget event logging.
 * `deeplink_launch` is the money metric: the closest proxy any
 * platform has for "a foreign tourist actually drove there".
 * No PII: session_key is a random per-browser id only.
 * ============================================================ */

export type RouteEventType =
  | "route_view"
  | "deeplink_launch"
  | "route_save"
  | "waypoint_open";

const SESSION_STORAGE_KEY = "krt-session";

function sessionKey(): string | null {
  try {
    let k = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!k) {
      k =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem(SESSION_STORAGE_KEY, k);
    }
    return k;
  } catch {
    return null;
  }
}

/** Analytics must never break or slow the UX — errors are swallowed. */
export function trackRouteEvent(
  type: RouteEventType,
  params: { routeId?: number; region?: string } = {}
): void {
  if (typeof window === "undefined") return;
  try {
    void getSupabaseBrowserClient()
      .from("route_events")
      .insert({
        event_type: type,
        route_id: params.routeId ?? null,
        region_name_en: params.region ?? null,
        lang: navigator.language ?? null,
        // TODO: fill from Vercel `x-vercel-ip-country` via a server action once deployed
        country: null,
        session_key: sessionKey(),
      })
      .then(
        () => undefined,
        () => undefined
      );
  } catch {
    /* ignore */
  }
}
