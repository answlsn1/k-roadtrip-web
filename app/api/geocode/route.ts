/* ============================================================
 * OSM Nominatim proxy — server-side so we can set a proper
 * User-Agent (Nominatim's usage policy requires one) and cache
 * repeat queries. Keyless and free; limited to Korea + English.
 *
 * GET /api/geocode?q=gyeongbokgung          → place search
 * GET /api/geocode?lat=37.5665&lng=126.978  → reverse (pin-drop)
 * ============================================================ */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UA = "K-RoadTrip/1.0 (https://k-roadtrip.app; contact@k-roadtrip.app)";

interface NominatimItem {
  osm_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  namedetails?: { "name:ko"?: string; name?: string };
}

interface GeocodeResult {
  sourceId: string;
  source: "osm";
  name_en: string;
  name_ko: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  type_tag: string;
}

// Simple in-memory cache (per server instance). Nominatim asks us
// not to hammer it; identical queries within the TTL are served free.
const cache = new Map<string, { at: number; data: GeocodeResult[] }>();
const TTL_MS = 1000 * 60 * 60; // 1 hour

// ── Reverse geocoding (builder pin-drop) ─────────────────────
// The Korean label feeds the Naver handoff (`place_name_ko`), so we ask
// Nominatim for Korean and fall back to a bare coordinate string whenever
// no usable address comes back. Always answers 200 — the builder popup
// must never break on a geocoder hiccup.

interface NominatimReverse {
  error?: string;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    village?: string;
    town?: string;
    borough?: string;
    city_district?: string;
    district?: string;
    county?: string;
    city?: string;
    province?: string;
    state?: string;
  };
}

const reverseCache = new Map<
  string,
  { at: number; label_ko: string; label_en: string }
>();

/** "서울특별시" → "서울", "부산광역시" → "부산" (도 names stay as-is). */
function shortRegion(name: string): string {
  return name.replace(/(특별자치시|특별자치도|특별시|광역시)$/, "");
}

/** Compact Korean label. Priority: ① road address (road + house number)
 *  ② neighbourhood level (quarter/suburb/…) ③ null → caller uses coords. */
function buildPinLabelKo(a: NominatimReverse["address"]): string | null {
  if (!a) return null;
  const region = a.city ?? a.province ?? a.state; // 시/도
  const district = a.borough ?? a.city_district ?? a.district ?? a.county; // 구/군
  const head = [
    region ? shortRegion(region) : null,
    district && district !== region ? district : null,
  ]
    .filter(Boolean)
    .join(" ");
  if (a.road) {
    const road = a.house_number ? `${a.road} ${a.house_number}` : a.road;
    return head ? `${head} ${road}` : road;
  }
  const local = a.quarter ?? a.suburb ?? a.neighbourhood ?? a.village ?? a.town;
  if (local) return head ? `${head} ${local}` : local;
  return head || null;
}

async function reverseGeocode(
  latRaw: string,
  lngRaw: string
): Promise<NextResponse> {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ pin: null, error: "bad_coords" }, { status: 200 });
  }

  const coordLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const fallback = {
    pin: { label_ko: coordLabel, label_en: coordLabel, latitude: lat, longitude: lng },
  };

  // Rough Korea bounding box — outside it a Korean address is meaningless,
  // so skip Nominatim entirely and answer with the coordinate label.
  if (lat < 33 || lat > 39 || lng < 124 || lng > 132) {
    return NextResponse.json(fallback);
  }

  // ~11 m grid: nearby taps share one cache entry (and one Nominatim call).
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = reverseCache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json({
      pin: {
        label_ko: cached.label_ko,
        label_en: cached.label_en,
        latitude: lat,
        longitude: lng,
      },
    });
  }

  const url =
    "https://nominatim.openstreetmap.org/reverse?" +
    new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      addressdetails: "1",
      zoom: "18",
      "accept-language": "ko",
    }).toString();

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json(fallback);

    const data = (await res.json()) as NominatimReverse;
    const label_ko = data.error ? null : buildPinLabelKo(data.address);
    if (!label_ko) return NextResponse.json(fallback);

    // The address is a proper noun — reuse it for the EN label too
    // (more readable than bare coordinates, and no second EN request).
    if (reverseCache.size > 500) reverseCache.clear();
    reverseCache.set(key, { at: Date.now(), label_ko, label_en: label_ko });
    return NextResponse.json({
      pin: { label_ko, label_en: label_ko, latitude: lat, longitude: lng },
    });
  } catch {
    return NextResponse.json(fallback);
  }
}

/** Map OSM class/type onto our type_tag vocabulary, best-effort. */
function toTypeTag(item: NominatimItem): string {
  const t = `${item.class ?? ""}/${item.type ?? ""}`;
  if (/restaurant|fast_food|food/.test(t)) return "restaurant";
  if (/cafe|coffee/.test(t)) return "cafe";
  if (/bakery/.test(t)) return "bakery";
  if (/beach|coast/.test(t)) return "beach";
  if (/temple|place_of_worship|monastery|shrine/.test(t)) return "heritage";
  if (/museum|attraction|monument|memorial|castle|ruins/.test(t)) return "sights";
  if (/peak|viewpoint|natural/.test(t)) return "scenic";
  return "landmark";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Reverse mode (builder pin-drop): ?lat=&lng= instead of ?q=.
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  if (latRaw !== null && lngRaw !== null) {
    return reverseGeocode(latRaw, lngRaw);
  }

  // Cap length so an oversized query can't be forwarded to Nominatim or bloat
  // the in-memory cache key.
  const q = (searchParams.get("q")?.trim() ?? "").slice(0, 80);

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json({ results: cached.data });
  }

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q,
      format: "json",
      countrycodes: "kr",
      "accept-language": "en",
      addressdetails: "0",
      namedetails: "1",
      limit: "6",
    }).toString();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
      },
      // Nominatim is slow-ish; don't let it hang the request forever.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ results: [], error: "geocoder_unavailable" }, { status: 200 });
    }

    const items = (await res.json()) as NominatimItem[];
    const results: GeocodeResult[] = items
      .map((item) => {
        const primary = item.name || item.display_name.split(",")[0];
        const name_ko = item.namedetails?.["name:ko"] ?? primary;
        const subtitle = item.display_name.split(",").slice(1, 3).join(",").trim();
        return {
          sourceId: `osm-${item.osm_id}`,
          source: "osm" as const,
          name_en: primary,
          name_ko,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          subtitle: subtitle || undefined,
          type_tag: toTypeTag(item),
        };
      })
      // Drop any row with non-finite coordinates so the map never gets NaN pins.
      .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude));

    // Bound the in-memory cache so distinct queries can't grow it without limit.
    if (cache.size > 500) cache.clear();
    cache.set(key, { at: Date.now(), data: results });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: "geocoder_error" }, { status: 200 });
  }
}
