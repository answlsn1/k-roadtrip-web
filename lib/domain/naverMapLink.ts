import { isAndroid, isIOS } from "@/lib/browserEnv";

export interface NaverRoutePoint {
  latitude: number;
  longitude: number;
  place_name_ko: string;
  sequence?: number;
  address_ko?: string | null;
}

const MAX_VIA_POINTS = 5;
const DEFAULT_APPNAME = "kroadtrip";

const enc = encodeURIComponent;

function sortBySequence<T extends NaverRoutePoint>(points: T[]): T[] {
  return [...points].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

function pickEvenly<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = (arr.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => arr[Math.round(i * step)]);
}

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

export function buildNaverWebSearchUrl(point: NaverRoutePoint): string {
  return `https://map.naver.com/p/search/${enc(point.place_name_ko)}`;
}

/** WGS84 decimal degrees → Web Mercator (EPSG:3857) in metres.
 *  Naver's /p/directions URL requires these projected coordinates,
 *  not WGS84 decimal degrees (which it silently ignores). */
function toMercator(lng: number, lat: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  const y =
    (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) *
      20037508.34) /
    Math.PI;
  return { x, y };
}

/** Web route URL — opens Naver Map web with the whole route pre-filled.
 *
 *  URL structure: /p/directions/{start}/{goal}/{via₁}/…/{viaₙ}/{mode}
 *    - slot 0   = start, slot 1 = goal, slots 2…n-1 = vias, last = "car"
 *    - empty slot = literal "-"
 *
 *  Each point: `{mercX},{mercY},{name},,`
 *    Coordinates must be Web Mercator (EPSG:3857), NOT WGS84 degrees —
 *    Naver silently rejects WGS84 and shows an empty map. */
export function buildNaverWebRouteUrl(points: NaverRoutePoint[]): string {
  const sorted = sortBySequence(points);
  if (sorted.length === 0) return "https://map.naver.com";
  if (sorted.length === 1) return buildNaverWebSearchUrl(sorted[0]);

  const start = sorted[0];
  const dest = sorted[sorted.length - 1];
  const vias = pickEvenly(sorted.slice(1, -1), MAX_VIA_POINTS);

  const pt = (p: NaverRoutePoint) => {
    const { x, y } = toMercator(p.longitude, p.latitude);
    return `${x},${y},${enc(p.place_name_ko)},,`;
  };

  const waypointSlots = vias.length ? vias.map(pt) : ["-"];
  const segments = [pt(start), pt(dest), ...waypointSlots, "car"];

  return `https://map.naver.com/p/directions/${segments.join("/")}`;
}

export function buildKoreanAddressList(points: NaverRoutePoint[]): string {
  return sortBySequence(points)
    .map(
      (p, i) =>
        `${i + 1}. ${p.place_name_ko}${p.address_ko ? ` — ${p.address_ko}` : ""}`
    )
    .join("\n");
}

export function toAndroidIntentUrl(
  nmapUrl: string,
  browserFallbackUrl: string
): string {
  const stripped = nmapUrl.replace(/^nmap:\/\//, "");
  return (
    `intent://${stripped}` +
    `#Intent;scheme=nmap;package=com.nhn.android.nmap;` +
    `S.browser_fallback_url=${encodeURIComponent(browserFallbackUrl)};end`
  );
}

export function resolveLaunchUrl(
  nmapUrl: string,
  webFallbackUrl: string
): string {
  return isAndroid() ? toAndroidIntentUrl(nmapUrl, webFallbackUrl) : nmapUrl;
}

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
  const onLeave = () => cleanup();
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
