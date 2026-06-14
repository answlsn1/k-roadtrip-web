"use client";

import { useEffect, useState } from "react";
import { useSavedStore } from "@/store/useSavedStore";
import { typeMeta } from "@/lib/config/constants";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

export default function MyTripPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { useSavedStore.persist.rehydrate(); }, []);
  const lang  = useLangStore((s) => s.lang);
  const saved = useSavedStore((s) => s.items);
  const remove = useSavedStore((s) => s.remove);
  const clearAll = useSavedStore((s) => s.clearAll);

  const copyKorean = () => {
    const text = saved.map((s) => s.place_name_ko).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Navbar button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 transition-colors hover:text-ink"
      >
        <span className="text-amber-400">★</span>
        {t("nav.mytrip", lang)}
        {saved.length > 0 && (
          <span className="ml-0.5 grid min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-extrabold text-white">
            {saved.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[900] bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[1000] flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-extrabold text-ink">{t("nav.mytrip", lang)}</h2>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-4xl">⭐</span>
            <p className="font-bold text-slate-700">No saved places yet</p>
            <p className="text-sm leading-relaxed text-slate-400">
              Tap ★ on any map marker to save a place for your trip.
            </p>
          </div>
        ) : (
          <>
            <p className="px-6 py-3 text-xs leading-relaxed text-slate-400">
              Traveler tip: add everything to Naver Map favorites in one sitting
              before the trip — not on the road.
            </p>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
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
                      className="shrink-0 text-slate-300 transition-colors hover:text-rose-400"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-2 border-t border-slate-100 px-6 pb-6 pt-4">
              <button
                onClick={copyKorean}
                className="w-full rounded-2xl bg-ink py-3.5 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
              >
                {copied ? "✓ Copied!" : "Copy all Korean names"}
              </button>
              <button
                onClick={clearAll}
                className="w-full rounded-2xl py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear all
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
