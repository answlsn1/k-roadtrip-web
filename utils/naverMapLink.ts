/* ============================================================
 * Naver Map deep-link builder (official nmap:// URL scheme)
 *
 * nmap://route/car
 *   ?slat&slng&sname        — start (omit → user's current location)
 *   &dlat&dlng&dname        — destination
 *   &v1lat&v1lng&v1name …   — via points (scheme supports v1–v5 max)
 *   &appname=kroadtrip
 *
 * `name` params must carry the exact Korean name (place_name_ko),
 * UTF-8 percent-encoded via encodeURIComponent.
 * ============================================================ */

import { isAndroid, isIOS } from "./browserEnv";

export interface NaverRoutePoint {
  latitude: number;
  longitude: number;
  place_name_ko: string;
  sequence?: number;
  address_ko?: string | null;
}

const MAX_VIA_POINTS = 5; // hard limit of the nmap scheme (v1–v5)
const DEFAULT_APPNAME = "kroadtrip";

const enc = encodeURIComponent;

function sortBySequence<T extends NaverRoutePoint>(points: T[]): T[] {
  return [...points].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

/** Keep driving order; when more vias than the scheme allows,
 *  sample evenly so the route shape is preserved. */
function pickEvenly<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = (arr.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => arr[Math.round(i * step)]);
}

/** waypoints[] → nmap://route/car?… (start = first, dest = last, rest = vias) */
export function buildNaverCarRouteLink(
  points: NaverRoutePoint[],
  opts: { appname?: string; useCurrentLocationAsStart?: boolean } = {}
): string {
  const { appname = DEFAULT_APPNAME, useCurrentLocationAsStart = false } = opts;
  const sorted = sortBySequence(points);
  if (sorted.length === 0) {
    throw new Error("buildNaverCarRouteLink: waypoints array is empty");
  }

  const dest = sorted[sorted.length - 1];
  const start =
    useCurrentLocationAsStart || sorted.length < 2 ? null : sorted[0];
  const vias = pickEvenly(sorted.slice(start ? 1 : 0, -1), MAX_VIA_POINTS);

  const params: string[] = [];
  if (start) {
    params.push(
      `slat=${start.latitude}`,
      `slng=${start.longitude}`,
      `sname=${enc(start.place_name_ko)}`
    );
  }
  params.push(
    `dlat=${dest.latitude}`,
    `dlng=${dest.longitude}`,
    `dname=${enc(dest.place_name_ko)}`
  );
  vias.forEach((v, i) => {
    params.push(
      `v${i + 1}lat=${v.latitude}`,
      `v${i + 1}lng=${v.longitude}`,
      `v${i + 1}name=${enc(v.place_name_ko)}`
    );
  });
  params.push(`appname=${enc(appname)}`);

  return `nmap://route/car?${params.join("&")}`;
}

/** Web fallback — Naver Map web search for the destination. */
export function buildNaverWebSearchUrl(point: NaverRoutePoint): string {
  return `https://map.naver.com/p/search/${enc(point.place_name_ko)}`;
}

/** Clipboard fallback — paste-ready Korean name/address list. */
export function buildKoreanAddressList(points: NaverRoutePoint[]): string {
  return sortBySequence(points)
    .map((p, i) => `${i + 1}. ${p.place_name_ko}${p.address_ko ? ` — ${p.address_ko}` : ""}`)
    .join("\n");
}

/** Android: wrap the nmap scheme in an intent:// URL — Chrome then
 *  handles "app not installed" itself (Play Store / fallback URL),
 *  which is far more reliable than a bare custom scheme. */
export function toAndroidIntentUrl(nmapUrl: string, browserFallbackUrl: string): string {
  const stripped = nmapUrl.replace(/^nmap:\/\//, "");
  return (
    `intent://${stripped}` +
    `#Intent;scheme=nmap;package=com.nhn.android.nmap;` +
    `S.browser_fallback_url=${encodeURIComponent(browserFallbackUrl)};end`
  );
}

/** Pick the most reliable launch URL for the current platform. */
export function resolveLaunchUrl(nmapUrl: string, webFallbackUrl: string): string {
  return isAndroid() ? toAndroidIntentUrl(nmapUrl, webFallbackUrl) : nmapUrl;
}

/** Fire the deep link; if the page is still visible after the delay,
 *  the app probably didn't open → run onFallback.
 *
 *  iOS quirk: the system "Open in Naver Map?" dialog can sit on screen
 *  longer than any timer without firing visibilitychange — so on iOS we
 *  wait longer AND treat pagehide/blur as success signals. False
 *  negatives (no fallback shown) are acceptable; false "it failed"
 *  modals are not. Returns a cancel function. */
export function launchDeepLink(
  url: string,
  opts: { fallbackDelayMs?: number; onFallback: () => void }
): () => void {
  const delay = opts.fallbackDelayMs ?? (isIOS() ? 2500 : 1600);

  const cleanup = () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onLeave);
    window.removeEventListener("blur", onLeave);
  };
  const onLeave = () => cleanup(); // app (or system dialog) took over
  const onVisibility = () => {
    if (document.hidden) cleanup();
  };

  const timer = window.setTimeout(() => {
    cleanup();
    if (!document.hidden) opts.onFallback();
  }, delay);

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", onLeave);
  window.addEventListener("blur", onLeave);

  window.location.href = url;
  return cleanup;
}
