/* ============================================================
 * OSM Nominatim proxy — server-side so we can set a proper
 * User-Agent (Nominatim's usage policy requires one) and cache
 * repeat queries. Keyless and free; limited to Korea + English.
 *
 * GET /api/geocode?q=gyeongbokgung
 * ============================================================ */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
        "User-Agent": "K-RoadTrip/1.0 (https://k-roadtrip.app; contact@k-roadtrip.app)",
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
