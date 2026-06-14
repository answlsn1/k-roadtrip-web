"use client";

import { useState } from "react";
import Link from "next/link";
import LangToggle from "@/components/home/LangToggle";
import MyTripPanel from "@/components/home/MyTripPanel";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link
            href="/"
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
            <a href="#courses" className="transition-colors hover:text-ink">Routes</a>
            <a href="#map" className="transition-colors hover:text-ink">Map</a>
            <a href="#why" className="transition-colors hover:text-ink">Why K-RoadTrip</a>
            <Link
              href="/builder"
              className="rounded-full bg-ink px-3.5 py-1.5 text-white transition-colors hover:bg-slate-700"
            >
              + Build Route
            </Link>
            <MyTripPanel />
            <LangToggle />
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/builder"
              className="rounded-full bg-ink px-3 py-1.5 text-sm font-extrabold text-white active:scale-95"
            >
              + Build Route
            </Link>
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" />

          {/* Sheet — sits flush under the 64px header */}
          <div
            className="absolute inset-x-0 top-16 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col px-4 py-3">
              <a
                href="#courses"
                onClick={close}
                className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              >
                Routes
              </a>
              <a
                href="#map"
                onClick={close}
                className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              >
                Map
              </a>
              <a
                href="#why"
                onClick={close}
                className="rounded-xl px-4 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              >
                Why K-RoadTrip
              </a>

              {/* Divider */}
              <div className="my-2 border-t border-slate-100" />

              {/* My Trip + Lang in one row */}
              <div className="flex items-center justify-between px-4 py-3">
                <MyTripPanel />
                <LangToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
