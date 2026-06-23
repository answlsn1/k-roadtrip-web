"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSavedStore } from "@/store/useSavedStore";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";
import { useBuilderStore } from "@/store/useBuilderStore";
import { useMyTripStore } from "@/store/useMyTripStore";
import { typeMeta } from "@/lib/config/constants";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import { useModalA11y } from "@/hooks/useModalA11y";
import { buildNaverWebRouteUrl, type NaverRoutePoint } from "@/lib/domain/naverMapLink";
import { trackEvent } from "@/lib/analytics/events";
import type { SavedTrip } from "@/lib/types";

/**
 * The My Trip drawer. Rendered ONCE, outside the navbar's hamburger, and opened
 * via the shared useMyTripStore — so any trigger (desktop nav / mobile hamburger)
 * controls it and closing the hamburger can't unmount it. Portaled to <body> so
 * the navbar's backdrop-blur can't clip the fixed drawer.
 */
export default function MyTripPanel() {
  const router = useRouter();
  const open = useMyTripStore((s) => s.open);
  const setOpen = useMyTripStore((s) => s.setOpen);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Re-read localStorage whenever the drawer opens, so a trip just saved on the
  // builder page always shows up (covers SPA/bfcache restores).
  useEffect(() => {
    useSavedStore.persist.rehydrate();
    useSavedTripsStore.persist.rehydrate();
  }, [open]);

  const lang = useLangStore((s) => s.lang);
  const saved = useSavedStore((s) => s.items);
  const remove = useSavedStore((s) => s.remove);
  const clearAll = useSavedStore((s) => s.clearAll);

  const trips = useSavedTripsStore((s) => s.trips);
  const removeTrip = useSavedTripsStore((s) => s.removeTrip);
  const loadDraft = useBuilderStore((s) => s.loadDraft);

  const dialogRef = useModalA11y<HTMLElement>(open);
  const count = trips.length + saved.length;
  const isEmpty = count === 0;

  const close = () => setOpen(false);

  const copyKorean = () => {
    const text = saved.map((s) => s.place_name_ko).join("\n");
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        /* clipboard blocked — silently ignore */
      }
    );
  };

  // Re-open a saved route in the builder to edit / hand off to Naver.
  const openTrip = (trip: SavedTrip) => {
    loadDraft({
      id: trip.id,
      title: trip.title,
      stops: trip.stops,
      updatedAt: trip.savedAt,
    });
    close();
    router.push("/builder");
  };

  const goBuild = () => {
    close();
    router.push("/builder");
  };

  // One-tap Naver handoff straight from a saved trip (same builder logic).
  const openInNaver = (trip: SavedTrip) => {
    const points: NaverRoutePoint[] = trip.stops.map((s, i) => ({
      latitude: s.latitude,
      longitude: s.longitude,
      place_name_ko: s.name_ko,
      sequence: i,
    }));
    trackEvent("naver_handoff", { routeId: trip.id });
    window.open(buildNaverWebRouteUrl(points), "_blank", "noopener,noreferrer");
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[900] bg-slate-900/50 backdrop-blur-sm"
          onClick={close}
        />
      )}

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.mytrip", lang)}
        className={`fixed bottom-0 right-0 top-0 z-[1000] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-extrabold text-ink">{t("nav.mytrip", lang)}</h2>
          <button
            onClick={close}
            className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label={t("common.close", lang)}
          >
            ✕
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-4xl">⭐</span>
            <p className="font-bold text-slate-700">{t("trip.empty", lang)}</p>
            <p className="text-sm leading-relaxed text-slate-400">{t("trip.emptyHint", lang)}</p>
            <button
              onClick={goBuild}
              className="mt-2 rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
            >
              {t("trip.buildCta", lang)}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* ── My saved routes ── */}
            {trips.length > 0 && (
              <section>
                <p className="px-6 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {t("trip.routesHeading", lang)}
                </p>
                <ul className="divide-y divide-slate-100">
                  {trips.map((trip) => (
                    <li key={trip.id} className="flex items-center gap-2 px-6 py-3.5">
                      <button
                        onClick={() => openTrip(trip)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-base">
                          🗺
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {trip.title}
                          </span>
                          <span className="block truncate text-xs text-slate-400">
                            {tf("route.stops", lang, { n: trip.stops.length })}
                          </span>
                        </span>
                      </button>
                      <button
                        onClick={() => openInNaver(trip)}
                        aria-label={t("trip.openInNaver", lang)}
                        title={t("trip.openInNaver", lang)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#03C75A] text-sm font-black text-white transition-transform active:scale-90"
                      >
                        N
                      </button>
                      <button
                        onClick={() => removeTrip(trip.id)}
                        className="-mr-2 grid h-9 w-9 shrink-0 place-items-center text-slate-300 transition-colors hover:text-rose-400"
                        aria-label={t("common.remove", lang)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Saved places (★ map markers) ── */}
            {saved.length > 0 && (
              <section className={trips.length > 0 ? "border-t border-slate-100" : ""}>
                <p className="px-6 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("trip.placesHeading", lang)}
                </p>
                <p className="px-6 pb-1 text-xs leading-relaxed text-slate-400">
                  {t("trip.tip", lang)}
                </p>
                <ul className="divide-y divide-slate-100">
                  {saved.map((s) => {
                    const meta = typeMeta(s.type_tag);
                    return (
                      <li key={s.id} className="flex items-center gap-3 px-6 py-3.5">
                        <span
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white"
                          style={{ background: meta.color }}
                        >
                          {meta.label_en.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {s.place_name_en}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {s.place_name_ko} · {s.region_name_en}
                          </p>
                        </div>
                        <button
                          onClick={() => remove(s.id)}
                          className="-mr-2 grid h-10 w-10 shrink-0 place-items-center text-slate-300 transition-colors hover:text-rose-400"
                          aria-label={t("common.remove", lang)}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-2 px-6 pb-6 pt-4">
                  <button
                    onClick={copyKorean}
                    className="w-full rounded-2xl bg-ink py-3.5 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
                  >
                    {copied ? t("common.copied", lang) : t("trip.copyAll", lang)}
                  </button>
                  <button
                    onClick={clearAll}
                    className="w-full rounded-2xl py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    {t("common.clearAll", lang)}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </aside>
    </>,
    document.body
  );
}
