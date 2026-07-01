"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getRouteWithStops, deleteRoute } from "@/lib/motorcycle/routes";
import type { MotorcycleRouteWithStops } from "@/lib/motorcycle/types";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";

const RouteDetailMap = dynamic(() => import("@/components/motorcycle/RouteDetailMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
      지도를 불러오는 중…
    </div>
  ),
});

export default function MotorcycleRouteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session } = useMotorcycleSession();

  const [route, setRoute] = useState<MotorcycleRouteWithStops | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getRouteWithStops(params.id).then(setRoute);
  }, [params.id]);

  const handleDelete = async () => {
    if (!route) return;
    if (!window.confirm("이 루트를 삭제할까요? 되돌릴 수 없어요.")) return;

    setDeleting(true);
    const ok = await deleteRoute(route.id);
    setDeleting(false);

    if (ok) {
      router.push("/motorcycle/my");
    } else {
      window.alert("삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (route === undefined) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">불러오는 중…</div>;
  }

  if (route === null) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-extrabold text-white">루트를 찾을 수 없어요</h1>
        <p className="mt-3 text-sm text-slate-400">삭제되었거나 존재하지 않는 루트예요.</p>
        <Link
          href="/motorcycle"
          className="mt-8 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink"
        >
          피드로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = session?.user.id === route.user_id;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          <span>{route.region || "지역 미정"}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{route.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-400">
          <span>{route.author_nickname}</span>
          <span aria-hidden="true">·</span>
          <span>{relativeTimeKo(route.created_at)}</span>
          {route.distance_km != null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{route.distance_km}km</span>
            </>
          )}
        </div>
        {route.description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">{route.description}</p>
        )}

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-6 rounded-full border border-red-500/40 px-5 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
          >
            {deleting ? "삭제하는 중…" : "삭제"}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="relative h-[320px] overflow-hidden rounded-2xl border border-white/15 sm:h-[420px] lg:h-[520px]">
          <RouteDetailMap stops={route.stops} />
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-bold text-white">경유지 ({route.stops.length}개)</h2>
          <ol className="space-y-3">
            {route.stops.map((stop, i) => (
              <li key={stop.id} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-extrabold text-ink">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{stop.name}</p>
                  {stop.note && (
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{stop.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
