"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPublicRoutes } from "@/lib/motorcycle/routes";
import type { MotorcycleRouteWithAuthor } from "@/lib/motorcycle/types";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import RouteCard from "@/components/motorcycle/RouteCard";

export default function MotorcycleHomePage() {
  const [routes, setRoutes] = useState<MotorcycleRouteWithAuthor[] | null>(null);
  const { isLoggedIn, loading } = useMotorcycleSession();

  useEffect(() => {
    listPublicRoutes().then(setRoutes);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <section className="py-14 text-center sm:py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
          K-Riders
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          오늘 달린 길, 라이더들과 나눠보세요
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          내가 달린 라이딩 루트를 기록하고, 다른 라이더들이 남긴 길을 발견하세요.
        </p>
        {!loading && !isLoggedIn && (
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/motorcycle/signup"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-extrabold text-ink transition-transform active:scale-[0.98]"
            >
              지금 시작하기
            </Link>
            <Link
              href="/motorcycle/login"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-amber-500/50"
            >
              로그인
            </Link>
          </div>
        )}
      </section>

      <section className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white sm:text-xl">공개 루트 피드</h2>
          {isLoggedIn && (
            <Link
              href="/motorcycle/routes/new"
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-extrabold text-ink transition-transform active:scale-[0.98] sm:text-sm"
            >
              루트 등록
            </Link>
          )}
        </div>

        {routes === null ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5 sm:rounded-3xl"
              />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-base font-bold text-white">
              아직 등록된 루트가 없어요, 첫 루트를 남겨보세요
            </p>
            <Link
              href={isLoggedIn ? "/motorcycle/routes/new" : "/motorcycle/login"}
              className="mt-5 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink transition-transform active:scale-[0.98]"
            >
              {isLoggedIn ? "첫 루트 등록하기" : "로그인하고 시작하기"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
