"use client";

import { useEffect, useState } from "react";
import type { Waypoint } from "@/lib/types";
import {
  buildKoreanAddressList,
  buildNaverCarRouteLink,
  buildNaverWebSearchUrl,
  buildNaverWebRouteUrl,
  launchDeepLink,
  resolveLaunchUrl,
} from "@/lib/domain/naverMapLink";
import { isInAppBrowser } from "@/lib/browserEnv";
import { trackRouteEvent } from "@/lib/analytics";

type Phase = "confirm" | "launching" | "fallback";

interface NavigationBridgeModalProps {
  open: boolean;
  onClose: () => void;
  /** Full route, or a single stop when launched from Trip Mode. */
  waypoints: Waypoint[];
  routeId?: number;
  regionNameEn?: string;
}

export default function NavigationBridgeModal({
  open,
  onClose,
  waypoints,
  routeId,
  regionNameEn,
}: NavigationBridgeModalProps) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [copied, setCopied] = useState<"none" | "address" | "link">("none");

  useEffect(() => {
    if (open) {
      setPhase("confirm");
      setCopied("none");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || waypoints.length === 0) return null;

  const ordered = [...waypoints].sort((a, b) => a.sequence - b.sequence);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const single = ordered.length === 1;
  const inApp = isInAppBrowser();

  const handleOpenApp = () => {
    setPhase("launching");
    trackRouteEvent("deeplink_launch", { routeId, region: regionNameEn });
    const nmapUrl = buildNaverCarRouteLink(ordered, {
      // single stop → navigate from wherever the user is right now
      useCurrentLocationAsStart: single,
    });
    launchDeepLink(resolveLaunchUrl(nmapUrl, buildNaverWebSearchUrl(last)), {
      onFallback: () => setPhase("fallback"),
    });
  };

  const copyText = async (text: string, kind: "address" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied("none"), 2000);
    } catch {
      /* clipboard blocked — silently ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        {/* Naver badge */}
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#03C75A] text-2xl font-black text-white shadow-lg shadow-green-500/30">
          N
        </div>

        <h2 className="mt-4 text-center text-lg font-extrabold text-slate-900">
          Opening Naver Map
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          Since Google Maps navigation doesn&apos;t work in Korea, we are
          transferring your route to Naver Map.
        </p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-400">
          Your stops are already set with exact Korean names — no typing
          needed. Tip: Naver Map has an English mode (Settings → Language).
        </p>

        {/* Route / stop summary */}
        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-center">
          {single ? (
            <>
              <p className="truncate text-sm font-bold text-slate-800">
                {first.sequence}. {first.place_name_en}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                From your current location
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-bold text-slate-800">
                {first.place_name_en} → {last.place_name_en}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {ordered.length} stops
                {ordered.length > 2 &&
                  ` · ${ordered.length - 2} via point${ordered.length > 3 ? "s" : ""}`}
              </p>
            </>
          )}
        </div>

        {/* In-app browser heads-up — shown BEFORE a failed attempt */}
        {inApp && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <p className="text-xs font-bold text-amber-700">
              You seem to be in an in-app browser
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700/80">
              If the app doesn&apos;t open, tap the ⋯ menu and choose
              &quot;Open in browser&quot;, or copy this page link into
              Safari/Chrome.
            </p>
            <button
              onClick={() => copyText(window.location.href, "link")}
              className="mt-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200"
            >
              {copied === "link" ? "Link copied ✓" : "Copy page link"}
            </button>
          </div>
        )}

        {phase !== "fallback" ? (
          <>
            <button
              onClick={handleOpenApp}
              disabled={phase === "launching"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3.5 text-base font-extrabold text-white transition-transform active:scale-[0.99] disabled:opacity-70"
            >
              {phase === "launching" ? "Opening…" : "Open App"}
            </button>
            {phase === "launching" && (
              <button
                onClick={() => setPhase("fallback")}
                className="mt-2 w-full py-1 text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                App didn&apos;t open? See other options
              </button>
            )}
          </>
        ) : (
          <>
            {/* Softened fallback — suggest, don't assert failure */}
            <p className="mt-4 text-center text-xs font-semibold text-slate-500">
              If the app didn&apos;t open, try one of these:
            </p>
            <button
              onClick={handleOpenApp}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
            >
              Try Open App again
            </button>
            <button
              onClick={() => copyText(buildKoreanAddressList(ordered), "address")}
              className="mt-2 w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
            >
              {copied === "address"
                ? "Copied! ✓ Paste into any map app"
                : "Copy Korean Address"}
            </button>
            <a
              href={single ? buildNaverWebSearchUrl(last) : buildNaverWebRouteUrl(ordered)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full rounded-2xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-600 hover:border-slate-400"
            >
              Open Naver Map on the web
            </a>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-1.5 text-center text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
