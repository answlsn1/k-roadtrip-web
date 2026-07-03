"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { listMyRoutes, deleteRoute } from "@/lib/motorcycle/routes";
import { getRiderStats } from "@/lib/motorcycle/profile";
import { RIDER_BADGES, MONTHLY_CHALLENGE_KM, monthlyKm } from "@/lib/motorcycle/badges";
import type { MotorcycleRouteWithAuthor } from "@/lib/motorcycle/types";
import RouteCard from "@/components/motorcycle/RouteCard";

export default function MyMotorcycleRoutesPage() {
  const router = useRouter();
  const { session, isLoggedIn, loading } = useMotorcycleSession();
  const [routes, setRoutes] = useState<MotorcycleRouteWithAuthor[] | null>(null);
  const [stats, setStats] = useState<{ routeCount: number; totalKm: number } | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    listMyRoutes().then(setRoutes);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!session) return;
    getRiderStats(session.user.id).then(setStats);
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("이 루트를 삭제할까요? 되돌릴 수 없어요.")) return;
    const ok = await deleteRoute(id);
    if (ok) {
      setRoutes((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } else {
      window.alert("삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (loading || !isLoggedIn) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>;
  }

  const earnedBadges = stats ? RIDER_BADGES.filter((b) => b.earned(stats)) : [];
  const monthKm = routes ? monthlyKm(routes) : 0;
  const challengeDone = monthKm >= MONTHLY_CHALLENGE_KM;
  const challengePct = Math.min(100, (monthKm / MONTHLY_CHALLENGE_KM) * 100);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="flex items-center justify-between py-10 sm:py-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">내 루트</p>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">내가 등록한 루트</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/motorcycle/me/edit"
            className="kr-btn-secondary px-4 py-2 text-xs sm:text-sm"
          >
            프로필 수정
          </Link>
          {routes && routes.length > 0 && (
            <Link
              href="/motorcycle/routes/new"
              className="kr-btn-primary px-4 py-2 text-xs sm:text-sm"
            >
              루트 등록
            </Link>
          )}
        </div>
      </div>

      {stats && routes !== null && (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="kr-card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-500">내 라이딩</p>
            <p className="mt-2 text-xl font-extrabold text-white">
              루트 {stats.routeCount}개{" "}
              <span aria-hidden="true" className="text-slate-500">·</span> 총 {stats.totalKm}km
            </p>
            {session && earnedBadges.length > 0 && (
              <Link
                href={`/motorcycle/riders/${session.user.id}`}
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                {earnedBadges.map((b) => (
                  <span
                    key={b.id}
                    className="rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400"
                  >
                    {b.emoji} {b.name}
                  </span>
                ))}
                <span className="text-xs font-semibold text-slate-400">전체 배지 보기 →</span>
              </Link>
            )}
          </div>

          <div className="kr-card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
                이달의 챌린지
              </p>
              {challengeDone && (
                <span className="text-xs font-extrabold text-amber-400">
                  🎉 이달의 챌린지 달성!
                </span>
              )}
            </div>
            <p className="mt-2 text-xl font-extrabold text-white">
              이번 달 {monthKm}km / {MONTHLY_CHALLENGE_KM}km
            </p>
            <div
              role="progressbar"
              aria-valuenow={Math.round(challengePct)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--kr-surface-2)]"
            >
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${challengePct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {routes === null ? (
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
          <p className="mt-5 text-base font-bold text-white">아직 등록한 루트가 없어요</p>
          <p className="mt-2 text-sm text-slate-400">첫 라이딩 루트를 기록해보세요.</p>
          <Link href="/motorcycle/routes/new" className="kr-btn-primary mt-6 px-6 py-2.5 text-sm">
            첫 루트 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} showVisibility onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
