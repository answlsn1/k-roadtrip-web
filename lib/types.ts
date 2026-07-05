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

export type StopSource = "curated" | "osm" | "sponsored" | "pin";

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

/** A custom route the user explicitly saved to "My Trip" (localStorage). */
export interface SavedTrip {
  id: string;
  title: string;
  stops: BuilderStop[];
  savedAt: number;
}

// ── Travel Expense Ledger ─────────────────────────────────────
// Headless data layer for the per-trip expense ledger. Pure client state
// (localStorage); no server/DB/analytics. UI (bottom sheet etc.) comes later.

export type ExpenseCategory =
  | "car" // rental car
  | "fuel" // fuel + tolls
  | "lodging"
  | "food"
  | "entrance" // admission / entry fees
  | "other";

/** Ordered list of categories — single source of truth for iteration/UI order. */
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "car",
  "fuel",
  "lodging",
  "food",
  "entrance",
  "other",
] as const;

/** A single logged expense. `amountKrw` is the normalized value the app sums on;
 *  `inputCurrency`/`inputAmount` preserve what the user actually typed. */
export interface ExpenseEntry {
  id: string;
  category: ExpenseCategory;
  amountKrw: number;
  inputCurrency: string;
  inputAmount: number;
  note?: string;
  loggedAt: string; // ISO timestamp
}

/** Per-trip ledger: pre-filled estimates + the user's actual logged entries. */
export interface TripLedger {
  tripId: string;
  estimates: Record<ExpenseCategory, number>; // KRW, auto pre-filled, editable
  entries: ExpenseEntry[];
  displayCurrency: string; // currency the UI renders approximations in
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
