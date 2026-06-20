import { getSupabaseServerClient } from "./supabaseServer";
import type {
  Route,
  Waypoint,
  MapWaypoint,
  RouteWithWaypoints,
} from "@/lib/types";

export type { Route, Waypoint, MapWaypoint, RouteWithWaypoints };

export async function getPublishedRoutes(): Promise<Route[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("is_published", true) // defensive: don't rely on RLS alone for "published"
    .order("region_name_en", { ascending: true })
    .order("id", { ascending: true });
  if (error || !data) return [];
  return data as Route[];
}

export async function getAllWaypointsForMap(): Promise<MapWaypoint[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("waypoints")
    .select(
      `id, place_name_en, place_name_ko, latitude, longitude, type_tag, sequence, routes!inner(slug, title_en, region_name_en)`
    )
    .order("route_id")
    .order("sequence");
  if (error || !data) return [];
  return (data as any[])
    .map((w) => {
      // Supabase serializes a many-to-one join as an object, but guard for an
      // array/null shape so a malformed row can't crash the whole map.
      const r = Array.isArray(w.routes) ? w.routes[0] : w.routes;
      if (!r) return null;
      return {
        id: w.id,
        place_name_en: w.place_name_en,
        place_name_ko: w.place_name_ko,
        latitude: w.latitude,
        longitude: w.longitude,
        type_tag: w.type_tag,
        sequence: w.sequence,
        route_slug: r.slug,
        route_title_en: r.title_en,
        region_name_en: r.region_name_en,
      };
    })
    .filter((w): w is MapWaypoint => w !== null);
}

export async function getRouteWithWaypoints(
  slug: string
): Promise<RouteWithWaypoints | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("routes")
    .select("*, waypoints(*)")
    .eq("slug", slug)
    .eq("is_published", true) // defensive: mirror the "published only" contract
    .maybeSingle();
  if (error || !data) return null;
  const { waypoints, ...route } = data as Route & { waypoints: Waypoint[] };
  return { route: route as Route, waypoints: waypoints ?? [] };
}
