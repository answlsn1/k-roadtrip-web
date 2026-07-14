"use client";

import { useState } from "react";
import Link from "next/link";
import BuildRouteFab from "@/components/home/BuildRouteFab";
import LangToggle from "@/components/home/LangToggle";
import MyTripButton from "@/components/home/MyTripButton";
import MyTripPanel from "@/components/home/MyTripPanel";
import ModeToggle from "@/components/bike/ModeToggle";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function Navbar({ mode = "car" }: { mode?: "car" | "bike" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const lang = useLangStore((s) => s.lang);
  const home = mode === "bike" ? "/bike" : "/";
  const isBike = mode === "bike";

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link
            href={home}
            onClick={close}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-lg font-extrabold tracking-tight text-ink"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-sm text-white">
              K
            </span>
            K-RoadTrip
          </Link>

          {/* Desktop menu */}
          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {isBike ? (
              <>
                {/* 루트 기준 앵커 — /privacy 등 서브페이지에서도 해당 화면으로 이동 */}
                <a href="/bike#routes" className="transition-colors hover:text-ink">{t("bike.nav.routes", lang)}</a>
                <a href="/bike#why"    className="transition-colors hover:text-ink">{t("bike.nav.why", lang)}</a>
                <Link
                  href="/bike#passport"
                  className="rounded-full bg-ink px-3.5 py-1.5 text-white transition-colors hover:bg-slate-700"
                >
                  {t("bike.nav.passport", lang)}
                </Link>
                <ModeToggle mode={mode} />
                <LangToggle />
              </>
            ) : (
              <>
                {/* Tertiary: quiet text anchors — the primary CTA lives in BuildRouteFab.
                    루트 기준(/#…) — /privacy 등 서브페이지에서도 홈 섹션으로 이동. */}
                <a href="/#courses" className="transition-colors hover:text-ink">{t("nav.routes", lang)}</a>
                <a href="/#map"     className="transition-colors hover:text-ink">{t("nav.map",    lang)}</a>
                <a href="/#why"     className="transition-colors hover:text-ink">{t("nav.why",    lang)}</a>
                {/* Utility cluster: one quiet visual unit, divided from the anchors. */}
                <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                  <MyTripButton />
                  <ModeToggle mode={mode} />
                  <LangToggle />
                </div>
              </>
            )}
          </div>

          {/* Mobile: CTA (bike only — car's primary CTA is BuildRouteFab) + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {isBike && (
              <Link
                href="/bike#passport"
                className="rounded-full bg-ink px-3 py-1.5 text-sm font-extrabold text-white active:scale-95"
              >
                {t("bike.nav.passport", lang)}
              </Link>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 active:bg-slate-50"
            >
              {open ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={close}>
          <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />
          <div
            className="absolute inset-x-0 top-16 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col px-4 py-3">
              {isBike ? (
                <>
                  <a href="/bike#routes" onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("bike.nav.routes", lang)}
                  </a>
                  <a href="/bike#why" onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("bike.nav.why", lang)}
                  </a>
                </>
              ) : (
                <>
                  <a href="/#courses" onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("nav.routes", lang)}
                  </a>
                  <a href="/#map"     onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("nav.map", lang)}
                  </a>
                  <a href="/#why"     onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("nav.why", lang)}
                  </a>
                  <Link href="/builder" onClick={close} className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100">
                    {t("nav.build", lang)}
                  </Link>
                </>
              )}
              <div className="my-2 border-t border-slate-100" />
              <div className="flex items-center justify-between px-4 py-3">
                {/* Opens the shared drawer + closes the hamburger (car mode only). */}
                {!isBike && <MyTripButton onOpen={close} />}
                <ModeToggle mode={mode} />
                <LangToggle />
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* My Trip drawer — car mode only, single instance outside the hamburger so
          closing the menu can't unmount it. Opened via useMyTripStore from either trigger. */}
      {!isBike && <MyTripPanel />}

      {/* Primary CTA — fixed right-middle pill, car mode only (hides itself on /builder). */}
      {!isBike && <BuildRouteFab />}
    </>
  );
}
