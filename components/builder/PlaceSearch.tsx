"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MapWaypoint, PlaceResult } from "@/lib/types";
import { buildCuratedFuse, searchCurated, searchOsm } from "@/lib/domain/search";
import { useBuilderStore } from "@/store/useBuilderStore";
import { typeMeta } from "@/lib/config/constants";
import type { SponsoredPlace } from "@/lib/config/sponsored";

interface PlaceSearchProps {
  curatedData: MapWaypoint[];
  onPreview: (results: PlaceResult[]) => void;
  sponsoredPlaces?: SponsoredPlace[];
}

export default function PlaceSearch({
  curatedData,
  onPreview,
  sponsoredPlaces = [],
}: PlaceSearchProps) {
  const [q, setQ] = useState("");
  const [curated, setCurated] = useState<PlaceResult[]>([]);
  const [osm, setOsm] = useState<PlaceResult[]>([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const addStop = useBuilderStore((s) => s.addStop);
  const stops = useBuilderStore((s) => s.draft.stops);

  const fuse = useMemo(() => buildCuratedFuse(curatedData), [curatedData]);

  // Instant Fuse.js search
  useEffect(() => {
    const hits = searchCurated(fuse, q);
    setCurated(hits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, fuse]);

  // Debounced OSM search (350 ms)
  useEffect(() => {
    if (q.trim().length < 2) {
      setOsm([]);
      setOsmLoading(false);
      return;
    }
    setOsmLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const results = await searchOsm(q, abortRef.current.signal);
      setOsm(results);
      setOsmLoading(false);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Keep map preview pins in sync with both result sets
  useEffect(() => {
    onPreview([...curated, ...osm]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curated, osm]);

  const addedKeys = new Set(stops.map((s) => `${s.source}:${s.sourceId}`));
  const isAdded = (p: PlaceResult) => addedKeys.has(`${p.source}:${p.sourceId}`);

  const handleAdd = (p: PlaceResult) => {
    const res = addStop(p);
    if (!res.ok && res.reason) {
      setFlash(res.reason);
      setTimeout(() => setFlash(null), 1800);
    }
  };

  const showPanel = q.trim().length >= 2;

  return (
    <div className="px-4">
      {/* Search input */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-slate-400">
        <svg
          className="h-4 w-4 shrink-0 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          autoComplete="off"
          placeholder="Search — e.g. Gyeongbokgung, 해운대"
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="shrink-0 text-slate-300 hover:text-slate-500"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {flash && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          {flash}
        </p>
      )}

      {showPanel && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* ── ⭐ Sponsored (always at top when searching) ── */}
          {sponsoredPlaces.length > 0 && (
            <>
              <p className="bg-amber-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                ⭐ Partner Picks · Sponsored
              </p>
              {sponsoredPlaces.map((p) => {
                const added = isAdded(p);
                return (
                  <button
                    key={`${p.source}:${p.sourceId}`}
                    onClick={() => handleAdd(p)}
                    disabled={added}
                    className="flex w-full items-center gap-3 border-b border-amber-100 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-amber-50/60 disabled:opacity-50"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-amber-400 text-[10px] font-extrabold text-amber-500">
                      ⭐
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">
                        {p.name_en}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {p.subtitle ?? ""}
                      </span>
                      {p.benefits && p.benefits.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {p.benefits.map((b) => (
                            <span
                              key={b}
                              className="rounded-full bg-emerald-500 px-2 py-px text-[9px] font-bold text-white"
                            >
                              ✓ {b}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span
                      className={`shrink-0 text-lg font-bold ${added ? "text-emerald-500" : "text-amber-400"}`}
                    >
                      {added ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {/* ── Local-verified picks (Fuse.js, instant) ── */}
          {curated.length > 0 && (
            <>
              <p className="bg-emerald-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                ✓ Local-verified picks
              </p>
              {curated.map((p) => (
                <ResultRow
                  key={`${p.source}:${p.sourceId}`}
                  p={p}
                  added={isAdded(p)}
                  onAdd={handleAdd}
                />
              ))}
            </>
          )}

          {/* ── All of Korea via OSM (debounced) ── */}
          <p
            className={`${curated.length > 0 ? "border-t border-slate-100" : ""} bg-slate-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400`}
          >
            {osmLoading ? "Searching all of Korea…" : "All of Korea · Powered by OSM"}
          </p>

          {osmLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-xs text-slate-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
              Searching…
            </div>
          ) : osm.length > 0 ? (
            osm.map((p) => (
              <ResultRow
                key={`${p.source}:${p.sourceId}`}
                p={p}
                added={isAdded(p)}
                onAdd={handleAdd}
              />
            ))
          ) : (
            <p className="px-4 py-4 text-center text-xs text-slate-400">
              {curated.length === 0
                ? "No results — try another keyword."
                : "No additional places found."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  p,
  added,
  onAdd,
}: {
  p: PlaceResult;
  added: boolean;
  onAdd: (p: PlaceResult) => void;
}) {
  const meta = typeMeta(p.type_tag ?? "landmark");
  return (
    <button
      onClick={() => onAdd(p)}
      disabled={added}
      className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-slate-50 disabled:opacity-50"
    >
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white"
        style={{ background: meta.color }}
      >
        {meta.label_en.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900">{p.name_en}</span>
        <span className="block truncate text-[11px] text-slate-400">
          {p.name_ko && p.name_ko !== p.name_en ? `${p.name_ko} · ` : ""}
          {p.subtitle ?? ""}
        </span>
      </span>
      <span
        className={`shrink-0 text-lg font-bold ${added ? "text-emerald-500" : "text-slate-300"}`}
      >
        {added ? "✓" : "+"}
      </span>
    </button>
  );
}
