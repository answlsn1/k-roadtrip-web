import Fuse from "fuse.js";
import type { MapWaypoint, PlaceResult } from "@/lib/types";

export function buildCuratedFuse(waypoints: MapWaypoint[]): Fuse<MapWaypoint> {
  return new Fuse(waypoints, {
    keys: [
      { name: "place_name_en", weight: 0.6 },
      { name: "place_name_ko", weight: 0.5 },
      { name: "region_name_en", weight: 0.3 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });
}

export function searchCurated(
  fuse: Fuse<MapWaypoint>,
  query: string,
  limit = 5
): PlaceResult[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return fuse
    .search(q)
    .filter((r) => (r.score ?? 1) < 0.6)
    .slice(0, limit)
    .map(({ item }) => ({
      sourceId: `wp-${item.id}`,
      source: "curated" as const,
      name_en: item.place_name_en,
      name_ko: item.place_name_ko,
      latitude: item.latitude,
      longitude: item.longitude,
      subtitle: `${item.region_name_en} · in ${item.route_title_en}`,
      type_tag: item.type_tag,
    }));
}

export async function searchOsm(
  query: string,
  signal?: AbortSignal
): Promise<PlaceResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, {
      signal,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: PlaceResult[] };
    return json.results ?? [];
  } catch {
    return [];
  }
}
