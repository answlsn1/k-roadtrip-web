"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLangStore } from "@/store/useLangStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/lib/i18n";

/**
 * The single primary CTA in car mode — a pill fixed to the right-middle of the
 * viewport ("+ Build Route" → /builder). The navbar stays tertiary/quiet so
 * this is the only solid-ink action on screen.
 *
 * - Desktop (md+): horizontal text pill. `nav.build` already carries the
 *   leading "+", so no extra icon (avoids "+ +").
 * - Mobile (<md): compact circle with a plus glyph; the label lives in
 *   aria-label.
 * - Hidden on /builder — the FAB's own destination.
 * - z-30: under navbar (z-50), mobile drawer (z-40) and the MyTripPanel /
 *   TripLedgerSheet layers (z-[900]+); above page content.
 * - Entrance: opacity fade + small slide-in. The slide is gated by
 *   prefers-reduced-motion; the fade is kept (see useReducedMotion docs).
 */
export default function BuildRouteFab() {
  const lang = useLangStore((s) => s.lang);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => setEntered(true), []);

  if (pathname?.startsWith("/builder")) return null;

  return (
    <Link
      href="/builder"
      aria-label={t("nav.build", lang)}
      className={[
        "fixed right-4 top-1/2 z-30 flex -translate-y-1/2 items-center justify-center",
        "rounded-full bg-ink text-white shadow-lg shadow-slate-900/25",
        "transition-all duration-300 ease-out hover:bg-slate-700 hover:shadow-xl active:scale-95",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        "h-12 w-12 md:right-6 md:h-auto md:w-auto md:px-5 md:py-3",
        entered ? "opacity-100" : "opacity-0",
        reducedMotion || entered ? "translate-x-0" : "translate-x-4",
      ].join(" ")}
    >
      {/* Mobile: plus glyph only — aria-label carries the text. */}
      <svg
        className="h-5 w-5 md:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
      </svg>
      {/* Desktop: text label (includes the leading "+"). */}
      <span className="hidden whitespace-nowrap text-sm font-extrabold md:inline">
        {t("nav.build", lang)}
      </span>
    </Link>
  );
}
