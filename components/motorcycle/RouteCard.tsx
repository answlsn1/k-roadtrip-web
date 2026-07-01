import Link from "next/link";
import type { MotorcycleRouteWithAuthor } from "@/lib/motorcycle/types";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";

interface RouteCardProps {
  route: MotorcycleRouteWithAuthor;
  /** 공개/비공개 배지 표시 여부 — 내 루트 목록에서만 필요. */
  showVisibility?: boolean;
  /** 삭제 버튼 — 내 루트 목록에서만 전달. */
  onDelete?: (id: string) => void;
}

export default function RouteCard({ route, showVisibility, onDelete }: RouteCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-amber-500/40 hover:bg-white/[0.07] sm:rounded-3xl sm:p-6">
      <Link href={`/motorcycle/routes/${route.id}`} className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-bold uppercase tracking-widest text-amber-500">
            {route.region || "지역 미정"}
          </span>
          {showVisibility && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                route.is_public
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {route.is_public ? "공개" : "비공개"}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-lg font-extrabold leading-snug text-white">{route.title}</h3>

        {route.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {route.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 text-xs font-semibold text-slate-500">
          <span>{route.author_nickname}</span>
          <span className="flex items-center gap-2">
            {route.distance_km != null && <span>{route.distance_km}km</span>}
            <span aria-hidden="true">·</span>
            <span>{relativeTimeKo(route.created_at)}</span>
          </span>
        </div>
      </Link>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(route.id)}
          className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold text-slate-300 transition-opacity hover:bg-red-500/80 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
        >
          삭제
        </button>
      )}
    </div>
  );
}
