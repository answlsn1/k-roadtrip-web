import { getSupabaseServerClient } from "./server";
import type { Route, Waypoint } from "@/components/route/RouteViewer";

export interface RouteWithWaypoints {
  route: Route;
  waypoints: Waypoint[];
}

export async function getPublishedRoutes(): Promise<Route[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("region_name_en", { ascending: true })
    .order("id", { ascending: true });
  if (error || !data) return [];
  return data as Route[];
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
    .maybeSingle();
  if (error || !data) return null;
  const { waypoints, ...route } = data as Route & { waypoints: Waypoint[] };
  return { route: route as Route, waypoints: waypoints ?? [] };
}
