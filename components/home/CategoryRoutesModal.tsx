"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLangStore } from "@/store/useLangStore";
import { t, tf, type DictKey } from "@/lib/i18n";
import { useModalA11y } from "@/hooks/useModalA11y";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import HorizontalScroller from "./HorizontalScroller";
import RoutePosterCard from "./RoutePosterCard";

export interface ModalRoute {
  slug: string;
  title_en: string;
  title_ko: string | null;
  thumbnail_url: string | null;
  description_en: string | null;
  description_ko: string | null;
}

interface CategoryRoutesModalProps {
  titleKey: DictKey;
  /** Category tile's own representative photo — reused here (same URL, so
   *  it's already in the browser cache from the tile grid) as a blurred
   *  backdrop instead of a flat white dialog. */
  image: string | null;
  routes: ModalRoute[];
  onClose: () => void;
}

// Must match the transition's duration-* class below — the exit delay is
// timed to it so the dialog finishes animating out before it actually unmounts.
const EXIT_MS = 300;

/**
 * Popup listing every route in one category tile. Portaled to <body> (the
 * navbar's backdrop-blur creates a containing block for fixed descendants,
 * which would otherwise clip this) — same pattern as MyTripPanel.
 * Bottom sheet on mobile, centered dialog on sm+. Backdrop is the category's
 * own photo, blurred and darkened, so this reads as a zoom-in on the tile
 * rather than a switch to a generic white sheet.
 *
 * Enter/exit animation: the parent unmounts this component the instant
 * `onClose` fires (it's rendered behind `openGroup && <Modal/>`), which
 * would normally cut off any exit transition mid-flight. `visible` is the
 * animated-state flag; closing sets it false and *delays* the real `onClose`
 * by EXIT_MS so the CSS transition can finish before React removes the DOM.
 */
export default function CategoryRoutesModal({ titleKey, image, routes, onClose }: CategoryRoutesModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const lang = useLangStore((s) => s.lang);
  const reduced = useReducedMotion();
  // A stale/404 image URL would otherwise leave the backdrop as a bare dark
  // scrim with no photo — not broken-looking, but not the intended blurred-
  // photo backdrop either. Fall back to the same gradient a missing image gets.
  const [bgImageFailed, setBgImageFailed] = useState(false);
  const showBgImage = image && !bgImageFailed;

  // ⚠️ Must pass `mounted`, not a literal `true` — this component portals in
  // on a second render (see `mounted` above), so containerRef is still null
  // on useModalA11y's first pass. A constant `true` dependency never changes
  // across that second render, so its focus-move effect would silently no-op
  // forever (React skips the effect since Object.is(true, true)).
  const containerRef = useModalA11y<HTMLDivElement>(mounted);

  // Animated-visible state: starts false so the very first paint is already
  // in the "closed" position, then flips true a frame later so the browser
  // actually has something to transition *from* (flipping it true in the
  // same render as mount would skip the transition — no prior frame to
  // interpolate from).
  const [visible, setVisible] = useState(false);
  // Kept in a ref (not just the effect's local `id`) so handleClose can
  // cancel it too — closing fast enough to land before this fires would
  // otherwise let it flip visible back to true *after* handleClose set it
  // false, reopening the transition mid-close instead of fading out.
  const mountRaf = useRef<number | null>(null);
  useEffect(() => {
    if (!mounted) return;
    mountRaf.current = requestAnimationFrame(() => {
      mountRaf.current = null;
      setVisible(true);
    });
    return () => {
      if (mountRaf.current !== null) cancelAnimationFrame(mountRaf.current);
    };
  }, [mounted]);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const handleClose = useCallback(() => {
    // Must run before setVisible(false) — otherwise a still-pending mount
    // rAF (see above) fires afterward and undoes it.
    if (mountRaf.current !== null) {
      cancelAnimationFrame(mountRaf.current);
      mountRaf.current = null;
    }
    setVisible(false);
    if (reduced) {
      onClose();
      return;
    }
    closeTimer.current = setTimeout(onClose, EXIT_MS);
  }, [reduced, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center">
      <div
        // pointer-events-none while closing — without it, the invisible
        // backdrop keeps intercepting clicks for the full 300ms exit
        // transition, which can swallow a same-spot tap on the next tile
        // if the user closes and immediately reopens a different category.
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(titleKey, lang)}
        className={`relative z-10 w-full overflow-hidden rounded-t-3xl shadow-2xl transition-all duration-300 ease-out motion-reduce:transition-opacity sm:max-w-lg sm:rounded-3xl ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-8 opacity-0 sm:translate-y-0 sm:scale-95"
        } motion-reduce:translate-y-0 motion-reduce:scale-100`}
      >
        {/* Blurred backdrop — the category's own photo (already cached from
            the tile grid), scaled up so the blur filter's soft edge falls
            outside the visible crop instead of showing as a sharp seam.
            blur-3xl is a 64px filter radius; 110% wasn't quite enough margin
            to fully clear that falloff (read as a faint vignette at the
            crop edge), so this is scaled up further. */}
        <div className="absolute inset-0" aria-hidden="true">
          {showBgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image!}
              alt=""
              onError={() => setBgImageFailed(true)}
              className="h-full w-full scale-125 object-cover blur-3xl"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-950" />
          )}
          <div className="absolute inset-0 bg-slate-950/65" />
        </div>

        {/* Scrollable content sits above the backdrop. max-h/overflow-y-auto
            is a defensive fallback (e.g. very short landscape viewports) —
            in practice a single carousel row rarely needs it. */}
        <div className="relative z-10 max-h-[80vh] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <h2 className="truncate text-xl font-extrabold text-white drop-shadow-sm">{t(titleKey, lang)}</h2>
              <span className="shrink-0 rounded-full bg-slate-950/50 px-2.5 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/20 backdrop-blur-md">
                {tf("library.routeCount", lang, { n: routes.length })}
              </span>
            </div>
            <button
              onClick={handleClose}
              aria-label={t("common.close", lang)}
              // The global :focus-visible outline (app/globals.css) is
              // near-black — invisible on this dialog's dark blurred-photo
              // surface. Same white-ring override HeroSlideshow/BuildRouteFab
              // use for their own dark/photo backgrounds.
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Netflix-row strip: -mx-6 bleeds the track past the dialog's own
              padding so the last card visibly peeks off the edge (scroll
              affordance), while px-6 on the track keeps the first/last card
              aligned with the header above instead of touching the dialog wall. */}
          <HorizontalScroller
            className="-mx-6"
            trackClassName="gap-3 px-6 pb-1 scroll-pl-6 scroll-pr-6"
            // Low alpha, not a color match — this fade double-composites on
            // top of the dialog's own bg-slate-950/65 scrim (the fade wrapper
            // only spans the card row, not the full dialog height), so a
            // strong value here reads as a hard-edged darker band the height
            // of the row. Kept faint enough that it stays a soft scroll hint
            // instead of a visible seam.
            fadeFrom="from-slate-950/25"
            prevLabel={t("common.previous", lang)}
            nextLabel={t("common.next", lang)}
            pageNavLabel={t("common.scrollPages", lang)}
            pageLabel={(n) => tf("common.pageN", lang, { n })}
          >
            {routes.map((r) => (
              <RoutePosterCard key={r.slug} route={r} onNavigate={onClose} />
            ))}
          </HorizontalScroller>
        </div>
      </div>
    </div>,
    document.body
  );
}
