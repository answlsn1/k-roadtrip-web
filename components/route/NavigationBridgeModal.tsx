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
import { isAndroid, isIOS, isInAppBrowser } from "@/lib/browserEnv";
import { trackEvent } from "@/lib/analytics/events";
import { useLangStore } from "@/store/useLangStore";
import { t, tf } from "@/lib/i18n";
import { useModalA11y } from "@/hooks/useModalA11y";

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
  const lang = useLangStore((s) => s.lang);
  const dialogRef = useModalA11y<HTMLDivElement>(open);

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
    trackEvent("naver_handoff", { routeId, region: regionNameEn });
    const webUrl = single
      ? buildNaverWebSearchUrl(last)
      : buildNaverWebRouteUrl(ordered);

    // Desktop has no Naver Map app. Attempting the nmap:// scheme there only
    // throws "scheme has no registered handler" and strands the modal on
    // "opening…" (the blur/visibility heuristics never resolve), so off mobile
    // we go straight to Naver Map on the web in a new tab.
    if (!isAndroid() && !isIOS()) {
      const win = window.open(webUrl, "_blank", "noopener,noreferrer");
      // If a popup blocker swallowed it, surface the explicit web link instead
      // of silently doing nothing.
      if (win) onClose();
      else setPhase("fallback");
      return;
    }

    // Mobile: try the Naver Map app deep link, fall back to web on failure.
    setPhase("launching");
    const nmapUrl = buildNaverCarRouteLink(ordered, {
      // single stop → navigate from wherever the user is right now
      useCurrentLocationAsStart: single,
    });
    launchDeepLink(resolveLaunchUrl(nmapUrl, webUrl), {
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
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("bridge.title", lang)}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
    >
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
          {t("bridge.title", lang)}
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          {t("bridge.body", lang)}
        </p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-400">
          {t("bridge.tip", lang)}
        </p>

        {/* Route / stop summary */}
        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-center">
          {single ? (
            <>
              <p className="truncate text-sm font-bold text-slate-800">
                {first.sequence}. {first.place_name_en}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t("bridge.fromCurrent", lang)}
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-bold text-slate-800">
                {first.place_name_en} → {last.place_name_en}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {tf("bridge.stopsCount", lang, { n: ordered.length })}
                {ordered.length > 2 &&
                  ` · ${tf(
                    ordered.length - 2 === 1 ? "bridge.viaOne" : "bridge.viaMany",
                    lang,
                    { n: ordered.length - 2 }
                  )}`}
              </p>
            </>
          )}
        </div>

        {/* In-app browser heads-up — shown BEFORE a failed attempt */}
        {inApp && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <p className="text-xs font-bold text-amber-700">
              {t("bridge.inAppTitle", lang)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700/80">
              {t("bridge.inAppBody", lang)}
            </p>
            <button
              onClick={() => copyText(window.location.href, "link")}
              className="mt-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200"
            >
              {copied === "link" ? t("common.linkCopied", lang) : t("common.copyLink", lang)}
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
              {phase === "launching" ? t("bridge.opening", lang) : t("bridge.openApp", lang)}
            </button>
            {phase === "launching" && (
              <button
                onClick={() => setPhase("fallback")}
                className="mt-2 w-full py-1 text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                {t("bridge.openFailed", lang)}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Softened fallback — suggest, don't assert failure */}
            <p className="mt-4 text-center text-xs font-semibold text-slate-500">
              {t("bridge.fallbackIntro", lang)}
            </p>
            <button
              onClick={handleOpenApp}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
            >
              {t("bridge.retryOpen", lang)}
            </button>
            <button
              onClick={() => copyText(buildKoreanAddressList(ordered), "address")}
              className="mt-2 w-full rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
            >
              {copied === "address"
                ? t("bridge.addrCopied", lang)
                : t("bridge.copyAddr", lang)}
            </button>
            <a
              href={single ? buildNaverWebSearchUrl(last) : buildNaverWebRouteUrl(ordered)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full rounded-2xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-600 hover:border-slate-400"
            >
              {t("bridge.openWeb", lang)}
            </a>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-1.5 text-center text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          {t("common.cancel", lang)}
        </button>
      </div>
    </div>
  );
}
