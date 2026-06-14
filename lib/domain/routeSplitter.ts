import type { BuilderStop } from "@/lib/types";
import {
  buildNaverWebRouteUrl,
  type NaverRoutePoint,
} from "@/lib/domain/naverMapLink";

const NAVER_MAX = 7;

export interface RouteChunk {
  stops: BuilderStop[];
  fromIdx: number;
  toIdx: number;
  url: string;
}

function toNaverPoints(stops: BuilderStop[]): NaverRoutePoint[] {
  return stops.map((s, i) => ({
    latitude: s.latitude,
    longitude: s.longitude,
    place_name_ko: s.name_ko,
    sequence: i,
  }));
}

/**
 * Splits stops into ≤7-stop chunks for Naver Map, overlapping by 1 stop
 * so each part starts where the previous part ended.
 * Returns null when no split is needed (stops.length ≤ 7).
 */
export function splitForNaver(stops: BuilderStop[]): RouteChunk[] | null {
  if (stops.length <= NAVER_MAX) return null;

  // step = 6: advance by NAVER_MAX-1 so the last stop of part N
  // becomes the first stop of part N+1 (keeps the route continuous).
  const step = NAVER_MAX - 1;
  const chunks: RouteChunk[] = [];

  for (let i = 0; i < stops.length; i += step) {
    const slice = stops.slice(i, i + NAVER_MAX);
    chunks.push({
      stops: slice,
      fromIdx: i + 1,
      toIdx: i + slice.length,
      url: buildNaverWebRouteUrl(toNaverPoints(slice)),
    });
    if (i + slice.length >= stops.length) break;
  }

  return chunks;
}
