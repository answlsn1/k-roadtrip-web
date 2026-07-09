import Link from "next/link";
import type { MotorcycleRouteWithAuthor, RouteSocial } from "@/lib/motorcycle/types";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";
import { routeTypeMeta } from "@/lib/motorcycle/routeTypes";
import { formatDurationKo, displayDuration } from "@/lib/motorcycle/rideEstimate";
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

export default function RouteCard({ route, social, showVisibility, onDelete }: RouteCardProps) {
  const typeMeta = routeTypeMeta(route.route_type);
  // distance_km 는 Postgres numeric — 문자열로 올 수 있어 Number() 로 강제.
  const distanceKm = route.distance_km != null ? Number(route.distance_km) : null;
  const showDistance = distanceKm != null && Number.isFinite(distanceKm) && distanceKm > 0;
  // 실측 duration_min 이 없으면 거리 기반 예상 시간(≈)으로 폴백.
  const duration = displayDuration(route.duration_min, route.distance_km);

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

      {/* 거리·시간 스탯 라인 — 비인터랙티브(오버레이 링크 클릭을 막지 않음). */}
      {(showDistance || duration) && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-300">
          {showDistance && (
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="6" cy="19" r="2.5" />
                <circle cx="18" cy="5" r="2.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.5 19h8a3.5 3.5 0 000-7h-9a3.5 3.5 0 010-7H15"
                />
              </svg>
              {distanceKm}km
            </span>
          )}
          {duration && (
            // title 툴팁은 오버레이 링크가 hover 를 가로채 절대 뜨지 않는다 —
            // 추정 표시는 "≈" + 스크린리더용 텍스트로 전달.
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
              </svg>
              {duration.estimated ? "≈ " : ""}
              {formatDurationKo(duration.min)}
              {duration.estimated && (
                <span className="sr-only">(거리 기반 예상 시간)</span>
              )}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs font-semibold text-slate-500">
        <Link
          href={`/motorcycle/riders/${route.user_id}`}
          className="relative z-10 truncate transition-colors hover:text-amber-400"
        >
          {route.author_nickname}
        </Link>
        <span className="shrink-0">{relativeTimeKo(route.created_at)}</span>
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
