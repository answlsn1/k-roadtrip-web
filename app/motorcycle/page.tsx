"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listPublicRoutes } from "@/lib/motorcycle/routes";
import { getSocialForRoutes } from "@/lib/motorcycle/social";
import type { MotorcycleRouteWithAuthor, RouteSocial } from "@/lib/motorcycle/types";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { ROUTE_TYPES } from "@/lib/motorcycle/routeTypes";
import RouteCard from "@/components/motorcycle/RouteCard";

type SortKey = "latest" | "popular" | "distance" | "winding";

const SORT_TABS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
  { key: "distance", label: "장거리순" },
  { key: "winding", label: "와인딩순" },
];

export default function MotorcycleHomePage() {
  const [routes, setRoutes] = useState<MotorcycleRouteWithAuthor[] | null>(null);
  const [social, setSocial] = useState<Record<string, RouteSocial> | null>(null);
  const [sort, setSort] = useState<SortKey>("latest");
  const [region, setRegion] = useState<string | null>(null);
  const [routeType, setRouteType] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { isLoggedIn, loading } = useMotorcycleSession();

  useEffect(() => {
    listPublicRoutes().then((fetched) => {
      setRoutes(fetched);
      getSocialForRoutes(fetched.map((r) => r.id)).then(setSocial);
    });
  }, []);

  const regions = useMemo(() => {
    if (!routes) return [];
    return Array.from(new Set(routes.map((r) => r.region).filter((r): r is string => !!r)));
  }, [routes]);

  const visibleRoutes = useMemo(() => {
    if (!routes) return null;
    const q = query.trim().toLowerCase();
    const filtered = routes.filter((r) => {
      if (region && r.region !== region) return false;
      if (routeType && r.route_type !== routeType) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q)
      );
    });
    if (sort === "popular") {
      return [...filtered].sort(
        (a, b) => (social?.[b.id]?.likeCount ?? 0) - (social?.[a.id]?.likeCount ?? 0)
      );
    }
    if (sort === "distance") {
      return [...filtered].sort((a, b) => (b.distance_km ?? 0) - (a.distance_km ?? 0));
    }
    if (sort === "winding") {
      // winding_score 는 Postgres numeric — 문자열일 수 있어 Number() 로 강제.
      return [...filtered].sort(
        (a, b) => Number(b.winding_score ?? 0) - Number(a.winding_score ?? 0)
      );
    }
    return filtered; // 최신순 — 서버가 이미 created_at desc 로 반환.
  }, [routes, social, sort, region, routeType, query]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <section className="py-10 sm:py-14">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-500">
          K-Riders
        </p>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl">
          오늘 달린 길, 라이더들과 나눠보세요
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          내가 달린 라이딩 루트를 기록하고, 다른 라이더들이 남긴 길을 발견하세요.
        </p>
        {!loading && !isLoggedIn && (
          <div className="mt-8 flex gap-3">
            <Link href="/motorcycle/signup" className="kr-btn-primary px-6 py-3 text-sm">
              지금 시작하기
            </Link>
            <Link href="/motorcycle/login" className="kr-btn-secondary px-6 py-3 text-sm">
              로그인
            </Link>
          </div>
        )}
      </section>

      <section className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white sm:text-xl">공개 루트 피드</h2>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <Link
                href="/motorcycle/record"
                className="kr-btn-secondary px-4 py-2 text-xs sm:text-sm"
              >
                🔴 주행 기록
              </Link>
              <Link
                href="/motorcycle/routes/new"
                className="kr-btn-primary px-4 py-2 text-xs sm:text-sm"
              >
                루트 등록
              </Link>
            </div>
          )}
        </div>

        {routes !== null && routes.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-fit gap-1 rounded-full border border-[var(--kr-line)] bg-[var(--kr-surface-1)] p-1">
                {SORT_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSort(tab.key)}
                    aria-pressed={sort === tab.key}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      sort === tab.key
                        ? "bg-amber-500 text-ink"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="루트 제목·설명 검색"
                aria-label="루트 검색"
                className="w-full rounded-full border border-[var(--kr-line-strong)] bg-[var(--kr-surface-1)] px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none sm:w-64"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="루트 유형 필터">
              <span className="w-7 shrink-0 text-[11px] font-bold text-slate-500">유형</span>
              <button
                type="button"
                onClick={() => setRouteType(null)}
                aria-pressed={routeType === null}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                  routeType === null
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                }`}
              >
                전체
              </button>
              {ROUTE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setRouteType(routeType === t.value ? null : t.value)}
                  aria-pressed={routeType === t.value}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    routeType === t.value
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {regions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="지역 필터">
                <span className="w-7 shrink-0 text-[11px] font-bold text-slate-500">지역</span>
                <button
                  type="button"
                  onClick={() => setRegion(null)}
                  aria-pressed={region === null}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    region === null
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                  }`}
                >
                  전체
                </button>
                {regions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(region === r ? null : r)}
                    aria-pressed={region === r}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                      region === r
                        ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                        : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {routes === null || visibleRoutes === null ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="kr-skeleton h-44" />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <div className="kr-card px-6 py-14 text-center">
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--kr-surface-2)] text-2xl"
            >
              🏁
            </div>
            <p className="mt-5 text-base font-bold text-white">
              아직 등록된 루트가 없어요, 첫 루트를 남겨보세요
            </p>
            <Link
              href={isLoggedIn ? "/motorcycle/routes/new" : "/motorcycle/login"}
              className="kr-btn-primary mt-6 px-6 py-2.5 text-sm"
            >
              {isLoggedIn ? "첫 루트 등록하기" : "로그인하고 시작하기"}
            </Link>
          </div>
        ) : visibleRoutes.length === 0 ? (
          <div className="kr-card px-6 py-14 text-center">
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--kr-surface-2)] text-2xl"
            >
              🛣️
            </div>
            <p className="mt-5 text-base font-bold text-white">조건에 맞는 루트가 없어요</p>
            <p className="mt-2 text-sm text-slate-400">검색어나 필터 조건을 바꿔보세요.</p>
          </div>
        ) : (
          <div className="kr-fade-up grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRoutes.map((route) => (
              <RouteCard key={route.id} route={route} social={social?.[route.id]} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
