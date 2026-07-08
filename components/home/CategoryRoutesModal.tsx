"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";
import { t, tf, type DictKey } from "@/lib/i18n";
import { useModalA11y } from "@/hooks/useModalA11y";

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
  routes: ModalRoute[];
  onClose: () => void;
}

/**
 * Popup listing every route in one category tile. Portaled to <body> (the
 * navbar's backdrop-blur creates a containing block for fixed descendants,
 * which would otherwise clip this) — same pattern as MyTripPanel.
 * Bottom sheet on mobile, centered dialog on sm+.
 */
export default function CategoryRoutesModal({ titleKey, routes, onClose }: CategoryRoutesModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const lang = useLangStore((s) => s.lang);
  const containerRef = useModalA11y<HTMLDivElement>(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(titleKey, lang)}
        className="relative z-10 max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-float-lg sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-xl font-extrabold text-ink">{t(titleKey, lang)}</h2>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
              {tf("library.routeCount", lang, { n: routes.length })}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close", lang)}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {routes.map((r) => {
            const title = lang === "ko" && r.title_ko ? r.title_ko : r.title_en;
            const desc = lang === "ko" ? r.description_ko : r.description_en;
            return (
              <Link
                key={r.slug}
                href={`/routes/${r.slug}`}
                onClick={onClose}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-float motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                  {r.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                      <svg className="h-6 w-6 text-white/15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="5.5" cy="5" r="2" fill="currentColor" />
                        <path d="M5.5 7.4v4.6a4 4 0 0 0 4 4h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.2" />
                        <circle cx="18.5" cy="18" r="2" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{title}</p>
                  {desc && <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{desc}</p>}
                </div>
                <span aria-hidden className="shrink-0 text-slate-300 transition-colors group-hover:text-amber-500">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
