"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

/* Serializable subset of Route — passed from the server component. */
export interface SearchableCourse {
  slug: string;
  title_en: string;
  title_ko: string | null;
  region_name_en: string;
  region_name_ko: string | null;
  theme_tags: string[];
  total_distance: number | string | null;
}

interface CourseSearchProps {
  courses: SearchableCourse[];
}

export default function CourseSearch({ courses }: CourseSearchProps) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  /* compact / combined virtual fields → "gyeongjuheritage", "안동 드라이브"
     and rough romanization all resolve (same trick as the MVP) */
  const fuse = useMemo(
    () =>
      new Fuse(
        courses.map((c) => ({
          ...c,
          compact: `${c.title_en}${c.region_name_en}${c.title_ko ?? ""}${c.region_name_ko ?? ""}`
            .toLowerCase()
            .replace(/\s+/g, ""),
          combined: `${c.region_name_en} ${c.region_name_ko ?? ""} ${c.title_en} ${c.title_ko ?? ""} ${c.theme_tags.join(" ")}`,
        })),
        {
          keys: [
            { name: "title_en", weight: 0.5 },
            { name: "title_ko", weight: 0.4 },
            { name: "region_name_en", weight: 0.45 },
            { name: "region_name_ko", weight: 0.45 },
            { name: "compact", weight: 0.4 },
            { name: "combined", weight: 0.3 },
            { name: "theme_tags", weight: 0.2 },
          ],
          threshold: 0.38,
          ignoreLocation: true,
          includeScore: true,
        }
      ),
    [courses]
  );

  const results =
    q.trim().length >= 2
      ? fuse
          .search(q.trim())
          .filter((r) => (r.score ?? 1) < 0.55)
          .slice(0, 5)
      : [];

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative mx-auto mt-10 max-w-xl text-left">
      <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-4 shadow-2xl shadow-slate-900/30">
        <svg
          className="h-5 w-5 shrink-0 text-slate-400"
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
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="text"
          autoComplete="off"
          placeholder='Try "andong" or "gyeongju heritage" — typos welcome!'
          className="w-full bg-transparent py-2 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-20 mt-3 max-h-80 overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-slate-900/30">
          {results.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm font-semibold text-slate-600">No matches found</p>
              <p className="mt-1 text-xs text-slate-400">
                Try a region (Andong, Gyeongju, Jeju…) or a theme (heritage, coastal…)
              </p>
            </div>
          ) : (
            results.map(({ item }) => (
              <Link
                key={item.slug}
                href={`/routes/${item.slug}`}
                className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {item.title_en}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {item.title_ko ? `${item.title_ko} · ` : ""}
                    {item.region_name_en}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-emerald-600">
                  {item.total_distance != null &&
                    `${Number(item.total_distance).toFixed(1)} km `}
                  →
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
