"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import NavigationBridgeModal from "./NavigationBridgeModal";
import SaveRouteButton from "./SaveRouteButton";
import type { Route, Waypoint } from "@/lib/types";
import { typeMeta, NAVER_GREEN } from "@/lib/config/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { trackEvent } from "@/lib/analytics/events";
import { useTripStore } from "@/store/useTripStore";
import { kmBetween, driveMin } from "@/lib/domain/geo";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";

const RouteLeafletMap = dynamic(() => import("./RouteLeafletMap"), { ssr: false });

interface RouteViewerProps {
  route: Route;
  waypoints: Waypoint[];
}

/* ============================================================
 * RouteViewer
 * Mobile : full-screen map + swipeable bottom sheet
 * Desktop: full-screen map + fixed left side panel (md+)
 * ============================================================ */
export default function RouteViewer({ route, waypoints }: RouteViewerProps) {
  const router = useRouter();
  const lang = useLangStore((s) => s.lang);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [bridgeTarget, setBridgeTarget] = useState<Waypoint[] | null>(null);

  // Go back to the previous page; fall back to home if opened directly (no history).
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  /* ---------- waypoint order (session-local reorder) ----------
   * The curated order from the server stays the source of truth.
   * `customOrder` holds waypoint ids in the user's order (null = default),
   * lives only in React state, and never touches the DB. `ordered` clones
   * the waypoints with sequence re-assigned 1..n so every consumer
   * (list, map markers, Naver handoff, copy list) follows automatically. */
  const defaultOrder = useMemo(
    () => [...waypoints].sort((a, b) => a.sequence - b.sequence),
    [waypoints]
  );
  const [customOrder, setCustomOrder] = useState<number[] | null>(null);
  const [orderNotice, setOrderNotice] = useState("");

  const ordered = useMemo(() => {
    if (!customOrder) return defaultOrder;
    const byId = new Map(defaultOrder.map((w) => [w.id, w]));
    return customOrder.flatMap((id, i) => {
      const w = byId.get(id);
      return w ? [{ ...w, sequence: i + 1 }] : [];
    });
  }, [defaultOrder, customOrder]);

  const isReordered = customOrder !== null;

  const moveWaypoint = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= ordered.length) return;
    const ids = (customOrder ?? defaultOrder.map((w) => w.id)).slice();
    [ids[index], ids[target]] = [ids[target], ids[index]];
    // Back to the curated order? Drop the override entirely.
    const isDefault = ids.every((id, i) => id === defaultOrder[i]?.id);
    setCustomOrder(isDefault ? null : ids);
    const moved = ordered[index];
    setOrderNotice(
      tf("route.orderAnnounce", lang, {
        name: lang === "ko" ? moved.place_name_ko : moved.place_name_en,
        n: target + 1,
      })
    );
  };

  const restoreOrder = () => {
    setCustomOrder(null);
    setOrderNotice(t("route.orderRestored", lang));
  };

  /* ---------- analytics: one view event per route mount ---------- */
  useEffect(() => {
    trackEvent("route_view", { routeId: route.slug, region: route.region_name_en });
  }, [route.slug, route.region_name_en]);

  /* ---------- Trip Mode progress ---------- */
  useEffect(() => { useTripStore.persist.rehydrate(); }, []);
  const progress = useTripStore((s) => s.progress[route.id] ?? 0);
  const advance = useTripStore((s) => s.advance);
  const resetTrip = useTripStore((s) => s.reset);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const nextStop = useMemo(
    () => (progress > 0 ? ordered.find((w) => w.sequence > progress) ?? null : null),
    [ordered, progress]
  );
  const tripComplete = progress > 0 && !nextStop;

  const navigateToStop = (w: Waypoint) => {
    advance(route.id, w.sequence);
    setBridgeTarget([w]);
  };

  /* ---------- bottom sheet (mobile only) ---------- */
  // SSR-safe: start from a fixed value (matches the server render) then sync to
  // the real viewport on mount, so the inline sheet style doesn't mismatch.
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    onResize();
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

  /* ---------- waypoint selection ---------- */
  const selectWaypoint = (w: Waypoint) => {
    const opening = selectedId !== w.id;
    setSelectedId(opening ? w.id : null);
    if (!isDesktop && snapIdx === 0) setSnapIdx(1);
  };

  const fmtKm = (v: Route["total_distance"]) =>
    v == null ? null : `${Number(v).toFixed(1)} km`;
  const fmtDur = (min: number | null) =>
    min == null ? null : min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`;

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
        <span>{tf("route.stops", lang, { n: ordered.length })}</span>
        {fmtKm(route.total_distance) && <span>🚗 {fmtKm(route.total_distance)}</span>}
        {fmtDur(route.total_duration) && (
          <span>⏱ {fmtDur(route.total_duration)} {t("route.driveSuffix", lang)}</span>
        )}
      </div>
      {isReordered && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            {t("route.customOrder", lang)}
          </span>
          <button
            onClick={restoreOrder}
            className="rounded-full px-2.5 py-1.5 text-[11px] font-bold text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-800"
          >
            {t("route.restoreOrder", lang)}
          </button>
        </div>
      )}
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
                  🚗 ≈ {tf("route.kmDrive", lang, { km: km.toFixed(1), min: driveMin(km) })}{" "}
                  {t("route.driveSuffix", lang)}
                </span>
              </div>
            )}
            <div
              className={`group flex w-full items-center gap-1 rounded-xl py-1 pl-1.5 pr-0.5 transition-colors ${
                selected ? "bg-slate-50" : "hover:bg-slate-50/60"
              }`}
            >
              <button
                onClick={() => selectWaypoint(w)}
                aria-expanded={selected}
                className="flex min-w-0 flex-1 items-center gap-3 py-1.5 text-left"
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
                    {w.place_name_ko} · {lang === "ko" ? meta.label_ko : meta.label_en}
                    {w.rating != null && ` · ★ ${Number(w.rating).toFixed(1)}`}
                    {w.review_count != null &&
                      ` (${tf("route.reviews", lang, { n: w.review_count.toLocaleString() })})`}
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
              <div className="flex shrink-0 items-center">
                <button
                  onClick={() => moveWaypoint(i, -1)}
                  disabled={i === 0}
                  aria-label={tf("route.moveUp", lang, {
                    name: lang === "ko" ? w.place_name_ko : w.place_name_en,
                  })}
                  className="grid h-11 w-11 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveWaypoint(i, 1)}
                  disabled={i === ordered.length - 1}
                  aria-label={tf("route.moveDown", lang, {
                    name: lang === "ko" ? w.place_name_ko : w.place_name_en,
                  })}
                  className="grid h-11 w-11 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

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
                  <span
                    className="grid h-4 w-4 place-items-center rounded bg-white text-[10px] font-black"
                    style={{ color: NAVER_GREEN }}
                  >
                    N
                  </span>
                  {t("route.navigateStop", lang)}
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
        <span
          className="grid h-6 w-6 place-items-center rounded-md bg-white text-sm font-black"
          style={{ color: NAVER_GREEN }}
        >
          N
        </span>
        {t("route.startNav", lang)}
      </button>
    </div>
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* screen-reader announcement for reorder actions */}
      <p role="status" aria-live="polite" className="sr-only">
        {orderNotice}
      </p>

      {/* ---------- full-screen Leaflet map ---------- */}
      <RouteLeafletMap
        waypoints={ordered}
        selectedId={selectedId}
        onSelect={selectWaypoint}
        progress={progress}
      />

      {/* ---------- Back button (floating over map on mobile) ---------- */}
      <button
        onClick={goBack}
        aria-label={t("nav.back", lang)}
        className="absolute left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg ring-1 ring-slate-900/5 backdrop-blur transition active:scale-95 md:hidden"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ---------- Trip Mode resume banner ---------- */}
      {!bannerDismissed && (nextStop || tripComplete) && (
        <div className="absolute left-1/2 top-4 z-20 flex max-w-[92%] -translate-x-1/2 items-center gap-1 rounded-full bg-slate-900/90 py-1.5 pl-4 pr-1.5 text-white shadow-xl backdrop-blur">
          {nextStop ? (
            <button
              onClick={() => setBridgeTarget([nextStop])}
              className="truncate text-sm font-bold"
            >
              {t("route.nextStop", lang)}: {nextStop.sequence}. {nextStop.place_name_en} →
            </button>
          ) : (
            <>
              <span className="text-sm font-bold">{t("route.tripComplete", lang)}</span>
              <button
                onClick={() => {
                  resetTrip(route.id);
                }}
                className="ml-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold hover:bg-white/25"
              >
                {t("common.reset", lang)}
              </button>
            </>
          )}
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label={t("common.dismiss", lang)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------- panel: ONE mount, repositioned per breakpoint ---------- */}
      {isDesktop ? (
        <aside className="absolute bottom-0 left-0 top-0 z-10 flex w-[400px] flex-col bg-white pt-4 shadow-2xl">
          <div className="px-5 pb-2">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {t("nav.back", lang)}
            </button>
          </div>
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
