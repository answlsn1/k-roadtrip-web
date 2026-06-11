"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import NavigationBridgeModal from "./NavigationBridgeModal";
import SaveRouteButton from "./SaveRouteButton";
import { typeMeta, NAVER_GREEN } from "@/lib/constants";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { trackRouteEvent } from "@/lib/analytics";
import { clearTripProgress, getTripProgress, setTripProgress } from "@/lib/tripMode";

/* ============================================================
 * Types — mirror the Task 1 Supabase schema (snake_case rows).
 * numeric columns may arrive as strings from supabase-js.
 * ============================================================ */
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

interface RouteViewerProps {
  route: Route;
  waypoints: Waypoint[];
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

/* Straight-line km × 1.35 road factor; drive time at 50 km/h (5-min steps) */
function kmBetween(a: Waypoint, b: Waypoint): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) *
      Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.35;
}
const driveMin = (km: number) => Math.max(5, Math.round((km / 50) * 60 / 5) * 5);

/* ============================================================
 * RouteViewer
 * Mobile : full-screen map + swipeable bottom sheet
 * Desktop: full-screen map + fixed left side panel (md+)
 * The panel renders exactly ONCE (no duplicate mounts of
 * SaveRouteButton / duplicate Supabase queries).
 * ============================================================ */
export default function RouteViewer({ route, waypoints }: RouteViewerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "krt-google-maps",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  /** null = bridge closed; full route or [single stop] (Trip Mode) */
  const [bridgeTarget, setBridgeTarget] = useState<Waypoint[] | null>(null);

  const ordered = useMemo(
    () => [...waypoints].sort((a, b) => a.sequence - b.sequence),
    [waypoints]
  );
  const path = useMemo(
    () => ordered.map((w) => ({ lat: w.latitude, lng: w.longitude })),
    [ordered]
  );

  /* ---------- analytics: one view event per route mount ---------- */
  useEffect(() => {
    trackRouteEvent("route_view", { routeId: route.id, region: route.region_name_en });
  }, [route.id, route.region_name_en]);

  /* ---------- Trip Mode progress ---------- */
  const [progress, setProgressState] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    setProgressState(getTripProgress(route.id));
  }, [route.id]);
  // refresh when the user comes back from Naver Map
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) setProgressState(getTripProgress(route.id));
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [route.id]);

  const nextStop = useMemo(
    () => (progress > 0 ? ordered.find((w) => w.sequence > progress) ?? null : null),
    [ordered, progress]
  );
  const tripComplete = progress > 0 && !nextStop;

  const navigateToStop = (w: Waypoint) => {
    setTripProgress(route.id, w.sequence);
    setProgressState(getTripProgress(route.id));
    setBridgeTarget([w]);
  };

  /* ---------- bottom sheet (mobile only) ---------- */
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const snaps = useMemo(
    () => [156, Math.round(vh * 0.46), Math.round(vh * 0.84)],
    [vh]
  );
  const [snapIdx, setSnapIdx] = useState(1);
  const [dragVisible, setDragVisible] = useState<number | null>(null);
  const drag = useRef({ startY: 0, startVisible: 0, active: false });

  const visible = dragVisible ?? snaps[snapIdx];
  const sheetHeight = snaps[2];

  const onDragPointerDown = (e: React.PointerEvent) => {
    drag.current = { startY: e.clientY, startVisible: visible, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const delta = drag.current.startY - e.clientY;
    // 4px threshold so taps on buttons inside the header still feel like taps
    if (dragVisible === null && Math.abs(delta) < 4) return;
    setDragVisible(
      Math.min(snaps[2], Math.max(snaps[0], drag.current.startVisible + delta))
    );
  };
  const onDragPointerUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragVisible !== null) {
      let best = 0;
      snaps.forEach((s, i) => {
        if (Math.abs(s - dragVisible) < Math.abs(snaps[best] - dragVisible)) best = i;
      });
      setSnapIdx(best);
    }
    setDragVisible(null);
  };

  /* ---------- map ---------- */
  const fitToWaypoints = useCallback(
    (m: google.maps.Map) => {
      if (ordered.length === 0) return;
      const bounds = new google.maps.LatLngBounds();
      ordered.forEach((w) => bounds.extend({ lat: w.latitude, lng: w.longitude }));
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      m.fitBounds(
        bounds,
        desktop
          ? { left: 440, top: 64, right: 64, bottom: 64 }
          : { left: 40, top: 72, right: 40, bottom: Math.round(window.innerHeight * 0.5) }
      );
    },
    [ordered]
  );

  const onMapLoad = useCallback(
    (m: google.maps.Map) => {
      mapRef.current = m;
      fitToWaypoints(m);
    },
    [fitToWaypoints]
  );

  // refit when the waypoint set changes (client-side route navigation)
  useEffect(() => {
    if (mapRef.current) fitToWaypoints(mapRef.current);
  }, [fitToWaypoints]);

  /* marker icons: cache per (color, n, selected) — no rebuild storms */
  const iconCache = useRef(new Map<string, google.maps.Icon>());
  const markerIcon = (color: string, n: number, selected: boolean): google.maps.Icon => {
    const key = `${color}/${n}/${selected ? 1 : 0}`;
    const cached = iconCache.current.get(key);
    if (cached) return cached;
    const size = selected ? 40 : 32;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" fill="${color}" stroke="#ffffff" stroke-width="3"/><text x="17" y="22" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">${n}</text></svg>`;
    const icon: google.maps.Icon = {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
    iconCache.current.set(key, icon);
    return icon;
  };

  const selectWaypoint = (w: Waypoint) => {
    const opening = selectedId !== w.id;
    if (opening) {
      trackRouteEvent("waypoint_open", { routeId: route.id, region: route.region_name_en });
    }
    setSelectedId(opening ? w.id : null);
    mapRef.current?.panTo({ lat: w.latitude, lng: w.longitude });
    if (!isDesktop && snapIdx === 0) setSnapIdx(1);
  };

  const fmtKm = (v: Route["total_distance"]) =>
    v == null ? null : `${Number(v).toFixed(1)} km`;
  const fmtDur = (min: number | null) =>
    min == null ? null : min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;

  if (loadError) {
    return (
      <div className="grid h-screen place-items-center text-sm text-slate-500">
        Failed to load the map. Please refresh.
      </div>
    );
  }

  /* ---------- panel pieces (rendered exactly once) ---------- */
  const summary = (
    <div className="px-5 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
            {route.region_name_en}
            {route.region_name_ko ? ` · ${route.region_name_ko}` : ""}
          </p>
          <h1 className="mt-1 text-xl font-extrabold leading-tight text-slate-900">
            {route.title_en}
          </h1>
          {route.title_ko && (
            <p className="mt-0.5 text-sm font-medium text-slate-400">{route.title_ko}</p>
          )}
        </div>
        <SaveRouteButton routeId={route.id} className="mt-1" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
        <span>{ordered.length} stops</span>
        {fmtKm(route.total_distance) && <span>🚗 {fmtKm(route.total_distance)}</span>}
        {fmtDur(route.total_duration) && <span>⏱ {fmtDur(route.total_duration)} drive</span>}
      </div>
      {route.theme_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {route.theme_tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const list = (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
      {ordered.map((w, i) => {
        const selected = selectedId === w.id;
        const visited = progress >= w.sequence && progress > 0;
        const meta = typeMeta(w.type_tag);
        const prev = i > 0 ? ordered[i - 1] : null;
        const km = prev ? kmBetween(prev, w) : null;
        return (
          <div key={w.id}>
            {km !== null && (
              <div className="my-1 flex items-center gap-2 pl-[15px]">
                <span className="h-4 w-px bg-slate-300" />
                <span className="text-[11px] font-semibold text-slate-400">
                  🚗 ≈ {km.toFixed(1)} km · {driveMin(km)} min drive
                </span>
              </div>
            )}
            <button
              onClick={() => selectWaypoint(w)}
              className={`group flex w-full items-center gap-3 rounded-xl px-1.5 py-2 text-left transition-colors ${
                selected ? "bg-slate-50" : "hover:bg-slate-50/60"
              }`}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white"
                style={{ background: meta.color }}
              >
                {visited ? "✓" : w.sequence}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {w.place_name_en}
                </span>
                <span className="block truncate text-[11px] text-slate-400">
                  {w.place_name_ko} · {meta.label_en}
                  {w.rating != null && ` · ★ ${Number(w.rating).toFixed(1)}`}
                  {w.review_count != null &&
                    ` (${w.review_count.toLocaleString()} reviews)`}
                </span>
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-slate-300 transition-transform ${
                  selected ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Inline detail: description + local intel + per-stop navigation */}
            {selected && (
              <div className="mb-2 ml-10 rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-sm text-slate-600">
                {w.description_en && <p className="leading-relaxed">{w.description_en}</p>}
                <div className="mt-2 space-y-1.5 text-[13px]">
                  {w.parking_note_en && <p>🅿️ {w.parking_note_en}</p>}
                  {w.booking_note_en && <p>🕐 {w.booking_note_en}</p>}
                  {w.address_en && <p>📍 {w.address_en}</p>}
                  {w.address_ko && <p className="text-slate-400">{w.address_ko}</p>}
                </div>
                <button
                  onClick={() => navigateToStop(w)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold text-white transition-transform active:scale-[0.99]"
                  style={{ background: NAVER_GREEN }}
                >
                  <span className="grid h-4 w-4 place-items-center rounded bg-white text-[10px] font-black" style={{ color: NAVER_GREEN }}>
                    N
                  </span>
                  Navigate to this stop
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const cta = (
    <div className="border-t border-slate-100 bg-white px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
      <button
        onClick={() => setBridgeTarget(ordered)}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-extrabold text-white shadow-lg shadow-green-500/30 transition-transform active:scale-[0.99]"
        style={{ background: NAVER_GREEN }}
      >
        <span className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black" style={{ color: NAVER_GREEN }}>
          N
        </span>
        Start Navigation with Naver Map
      </button>
    </div>
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* ---------- full-screen map ---------- */}
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ position: "absolute", inset: 0 }}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: "greedy",
            styles: MAP_STYLES,
            clickableIcons: false,
          }}
        >
          <PolylineF
            path={path}
            options={{ strokeColor: "#0f172a", strokeOpacity: 0.65, strokeWeight: 3 }}
          />
          {ordered.map((w) => (
            <MarkerF
              key={w.id}
              position={{ lat: w.latitude, lng: w.longitude }}
              icon={markerIcon(typeMeta(w.type_tag).color, w.sequence, selectedId === w.id)}
              zIndex={selectedId === w.id ? 1000 : w.sequence}
              title={`${w.sequence}. ${w.place_name_en}`}
              onClick={() => selectWaypoint(w)}
            />
          ))}
        </GoogleMap>
      ) : (
        <div className="grid h-full place-items-center text-sm text-slate-400">
          Loading map…
        </div>
      )}

      {/* ---------- Trip Mode resume banner ---------- */}
      {!bannerDismissed && (nextStop || tripComplete) && (
        <div className="absolute left-1/2 top-4 z-20 flex max-w-[92%] -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900/90 py-1.5 pl-4 pr-1.5 text-white shadow-xl backdrop-blur">
          {nextStop ? (
            <button
              onClick={() => setBridgeTarget([nextStop])}
              className="truncate text-sm font-bold"
            >
              Next stop: {nextStop.sequence}. {nextStop.place_name_en} →
            </button>
          ) : (
            <>
              <span className="text-sm font-bold">Trip complete 🎉</span>
              <button
                onClick={() => {
                  clearTripProgress(route.id);
                  setProgressState(0);
                }}
                className="ml-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold hover:bg-white/25"
              >
                Reset
              </button>
            </>
          )}
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------- panel: ONE mount, repositioned per breakpoint ---------- */}
      {isDesktop ? (
        <aside className="absolute bottom-0 left-0 top-0 z-10 flex w-[400px] flex-col bg-white pt-5 shadow-2xl">
          {summary}
          {list}
          {cta}
        </aside>
      ) : (
        <section
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.15)]"
          style={{
            height: sheetHeight,
            transform: `translateY(${sheetHeight - visible}px)`,
            transition:
              dragVisible === null ? "transform 280ms cubic-bezier(0.22,1,0.36,1)" : "none",
          }}
        >
          {/* drag surface = handle + whole summary header (44px+ friendly);
              touch-action none lives HERE, not on the sheet, so the
              waypoint list below stays touch-scrollable */}
          <div
            className="touch-none"
            onPointerDown={onDragPointerDown}
            onPointerMove={onDragPointerMove}
            onPointerUp={onDragPointerUp}
          >
            <div className="flex cursor-grab justify-center pb-2 pt-3 active:cursor-grabbing">
              <span className="h-1.5 w-10 rounded-full bg-slate-200" />
            </div>
            {summary}
          </div>
          {list}
          {cta}
        </section>
      )}

      {/* ---------- Naver deep-link bridge (full route or single stop) ---------- */}
      <NavigationBridgeModal
        open={bridgeTarget !== null}
        onClose={() => setBridgeTarget(null)}
        waypoints={bridgeTarget ?? []}
        routeId={route.id}
        regionNameEn={route.region_name_en}
      />
    </div>
  );
}
