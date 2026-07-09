"use client";

import { useState } from "react";
import { useLangStore } from "@/store/useLangStore";
import { t, tf, type DictKey } from "@/lib/i18n";
import CategoryRoutesModal, { type ModalRoute } from "./CategoryRoutesModal";

export interface CategoryGroup {
  id: string;
  titleKey: DictKey;
  image: string | null;
  routes: ModalRoute[];
}

/**
 * Category tile grid — replaces the long horizontal-scroll rows. Each tile is
 * one category (text + a single representative photo); clicking opens
 * CategoryRoutesModal listing every route in that category.
 */
export default function CategoryTileGrid({ groups }: { groups: CategoryGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);
  const openGroup = groups.find((g) => g.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-5 sm:grid-cols-3 sm:gap-5 sm:px-0 lg:grid-cols-4">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setOpenId(g.id)}
            className="group relative aspect-[3/4] overflow-hidden rounded-3xl text-left shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-amber-300/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {g.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                <svg className="h-10 w-10 text-white/10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="5.5" cy="5" r="2" fill="currentColor" />
                  <path d="M5.5 7.4v4.6a4 4 0 0 0 4 4h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.2" />
                  <circle cx="18.5" cy="18" r="2" fill="currentColor" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 via-35% to-transparent to-70%" />
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-slate-950/55 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md">
                {tf("library.routeCount", lang, { n: g.routes.length })}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 pr-14">
              <h3 className="text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-xl">
                {t(g.titleKey, lang)}
              </h3>
            </div>
            <span
              aria-hidden
              className="absolute bottom-4 right-4 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors duration-300 group-hover:bg-amber-300 group-hover:text-slate-900 motion-reduce:transition-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>
      {openGroup && (
        <CategoryRoutesModal titleKey={openGroup.titleKey} routes={openGroup.routes} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
