import Link from "next/link";
import type { MotorcycleRouteWithAuthor, RouteSocial } from "@/lib/motorcycle/types";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";
import { routeTypeMeta } from "@/lib/motorcycle/routeTypes";
import LikeButton from "@/components/motorcycle/LikeButton";

interface RouteCardProps {
  route: MotorcycleRouteWithAuthor;
  /** 좋아요·댓글 집계 — 있으면 카드 하단에 소셜 줄을 렌더. */
  social?: RouteSocial;
  /** 공개/비공개 배지 표시 여부 — 내 루트 목록에서만 필요. */
  showVisibility?: boolean;
  /** 삭제 버튼 — 내 루트 목록에서만 전달. */
  onDelete?: (id: string) => void;
}

function formatDurationKo(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export default function RouteCard({ route, social, showVisibility, onDelete }: RouteCardProps) {
  const typeMeta = routeTypeMeta(route.route_type);

  return (
    <div className="kr-card kr-card-hover group relative flex flex-col p-5 sm:p-6">
      {/* 카드 전체를 덮는 오버레이 링크 — 작성자/좋아요는 z-10으로 위에 얹는다. */}
      <Link
        href={`/motorcycle/routes/${route.id}`}
        aria-label={route.title}
        className="absolute inset-0 z-0 rounded-[1.25rem]"
      />

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs font-bold uppercase tracking-widest text-amber-500">
            {route.region || "지역 미정"}
          </span>
          {typeMeta && (
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
              {typeMeta.emoji} {typeMeta.label}
            </span>
          )}
          {route.moto_safe === true && (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              🛵 안전경로
            </span>
          )}
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

      {route.winding_score != null && (
        <span className="mb-2 w-fit rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
          🌀 와인딩 {Number(route.winding_score)}
        </span>
      )}

      {route.description && (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {route.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs font-semibold text-slate-500">
        <Link
          href={`/motorcycle/riders/${route.user_id}`}
          className="relative z-10 truncate transition-colors hover:text-amber-400"
        >
          {route.author_nickname}
        </Link>
        <span className="flex shrink-0 items-center gap-2">
          {route.distance_km != null && (
            <>
              <span className="font-bold text-slate-300">{route.distance_km}km</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          {route.duration_min != null && (
            <>
              <span className="font-bold text-slate-300">
                {formatDurationKo(route.duration_min)}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{relativeTimeKo(route.created_at)}</span>
        </span>
      </div>

      {social && (
        <div className="relative z-10 mt-3 flex items-center gap-4 border-t border-[var(--kr-line)] pt-3">
          <LikeButton
            routeId={route.id}
            initialCount={social.likeCount}
            initialLiked={social.likedByMe}
            compact
          />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h8M8 8h8m-9 8l-3 3V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9z"
              />
            </svg>
            {social.commentCount}
          </span>
        </div>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(route.id)}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold text-slate-300 transition-opacity hover:bg-red-500/80 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
        >
          삭제
        </button>
      )}
    </div>
  );
}
