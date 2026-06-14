// Single source of truth for all shared domain types.
// lib/data/queries.ts, components, and stores all import from here.

// ── Supabase route schema ─────────────────────────────────────

export interface Route {
  id: number;
  slug: string;
  region_name_en: string;
  region_name_ko: string | null;
  title_en: string;
  title_ko: string | null;
  description_en: string | null;
  description_ko: string | null;
  total_distance: number | string | null;
  total_duration: number | null;
  theme_tags: string[];
  thumbnail_url: string | null;
}

export interface Waypoint {
  id: number;
  route_id: number;
  sequence: number;
  place_name_en: string;
  place_name_ko: string;
  latitude: number;
  longitude: number;
  description_en: string | null;
  description_ko: string | null;
  type_tag: string;
  address_en: string | null;
  address_ko: string | null;
  rating: number | string | null;
  review_count: number | null;
  parking_note_en: string | null;
  parking_note_ko: string | null;
  booking_note_en: string | null;
  booking_note_ko: string | null;
}

export interface RouteWithWaypoints {
  route: Route;
  waypoints: Waypoint[];
}

// ── Map overview (all published waypoints) ────────────────────

export interface MapWaypoint {
  id: number;
  place_name_en: string;
  place_name_ko: string;
  latitude: number;
  longitude: number;
  type_tag: string;
  sequence: number;
  route_slug: string;
  route_title_en: string;
  region_name_en: string;
}

// ── Builder ───────────────────────────────────────────────────

export type StopSource = "curated" | "osm" | "sponsored";

export interface PlaceResult {
  sourceId: string;
  source: StopSource;
  name_en: string;
  name_ko: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  type_tag?: string;
}

export interface BuilderStop {
  tempId: string;
  source: StopSource;
  sourceId: string;
  name_en: string;
  name_ko: string;
  latitude: number;
  longitude: number;
  type_tag: string;
}

export interface RouteDraft {
  id: string;
  title: string;
  stops: BuilderStop[];
  updatedAt: number;
}

export function placeToStop(p: PlaceResult): BuilderStop {
  return {
    tempId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    source: p.source,
    sourceId: p.sourceId,
    name_en: p.name_en,
    name_ko: p.name_ko,
    latitude: p.latitude,
    longitude: p.longitude,
    type_tag: p.type_tag ?? "landmark",
  };
}
