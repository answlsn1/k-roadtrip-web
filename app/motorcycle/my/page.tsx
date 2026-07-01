"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { listMyRoutes, deleteRoute } from "@/lib/motorcycle/routes";
import type { MotorcycleRouteWithAuthor } from "@/lib/motorcycle/types";
import RouteCard from "@/components/motorcycle/RouteCard";

export default function MyMotorcycleRoutesPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useMotorcycleSession();
  const [routes, setRoutes] = useState<MotorcycleRouteWithAuthor[] | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    listMyRoutes().then(setRoutes);
  }, [isLoggedIn]);

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

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="flex items-center justify-between py-10 sm:py-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">내 루트</p>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">내가 등록한 루트</h1>
        </div>
        {routes && routes.length > 0 && (
          <Link
            href="/motorcycle/routes/new"
            className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-xs font-extrabold text-ink transition-transform active:scale-[0.98] sm:text-sm"
          >
            루트 등록
          </Link>
        )}
      </div>

      {routes === null ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5 sm:rounded-3xl" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-base font-bold text-white">아직 등록한 루트가 없어요</p>
          <p className="mt-2 text-sm text-slate-400">첫 라이딩 루트를 기록해보세요.</p>
          <Link
            href="/motorcycle/routes/new"
            className="mt-5 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink transition-transform active:scale-[0.98]"
          >
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
