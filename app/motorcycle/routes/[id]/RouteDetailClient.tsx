"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRouteWithStops, deleteRoute } from "@/lib/motorcycle/routes";
import {
  getSocialForRoutes,
  listComments,
  addComment,
  deleteComment,
  followRider,
  unfollowRider,
  isFollowing,
} from "@/lib/motorcycle/social";
import type {
  MotorcycleComment,
  MotorcycleRouteWithStops,
  RouteSocial,
} from "@/lib/motorcycle/types";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";
import { routeTypeMeta } from "@/lib/motorcycle/routeTypes";
import { windingGrade } from "@/lib/motorcycle/windingScore";
import { downloadGpx } from "@/lib/motorcycle/gpx";
import { buildNaverWebRouteUrl, type NaverRoutePoint } from "@/lib/domain/naverMapLink";
import LikeButton from "@/components/motorcycle/LikeButton";

const RouteDetailMap = dynamic(() => import("@/components/motorcycle/RouteDetailMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">
      지도를 불러오는 중…
    </div>
  ),
});

function formatDurationKo(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export default function RouteDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { session, profile, isLoggedIn, loading: sessionLoading } = useMotorcycleSession();

  const [route, setRoute] = useState<MotorcycleRouteWithStops | null | undefined>(undefined);
  const [deleting, setDeleting] = useState(false);
  const [social, setSocial] = useState<RouteSocial | null>(null);
  const [comments, setComments] = useState<MotorcycleComment[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getRouteWithStops(id).then(setRoute);
    getSocialForRoutes([id]).then((map) => setSocial(map[id] ?? null));
    listComments(id).then(setComments);
  }, [id]);

  useEffect(() => {
    if (!route || !session) return;
    if (session.user.id === route.user_id) return;
    isFollowing(route.user_id).then(setFollowing);
  }, [route, session]);

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

  const handleFollowToggle = async () => {
    if (!route || following === null || followBusy) return;
    // 낙관적 반영 — 실패 시 원복.
    const prev = following;
    setFollowing(!prev);
    setFollowBusy(true);
    const result = prev ? await unfollowRider(route.user_id) : await followRider(route.user_id);
    setFollowBusy(false);
    if (!result.ok) setFollowing(prev);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!route || !profile || commentSubmitting) return;
    const text = commentText.trim();
    if (!text) return;

    setCommentSubmitting(true);
    const result = await addComment(route.id, profile.nickname, text);
    setCommentSubmitting(false);

    if (result.ok && result.comment) {
      const added = result.comment;
      setComments((prev) => (prev ? [...prev, added] : [added]));
      setCommentText("");
    } else {
      window.alert("댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleShare = async () => {
    if (!route) return;
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: route.title, url });
      } catch {
        // 사용자가 공유 시트를 닫은 경우(AbortError) — 무시.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // 클립보드 권한 거부 등 — 조용히 무시.
    }
  };

  const handleGpxDownload = () => {
    if (!route) return;
    if (!isLoggedIn) {
      router.push("/motorcycle/login");
      return;
    }
    downloadGpx(route, window.location.origin);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    const ok = await deleteComment(commentId);
    if (ok) {
      setComments((prev) => (prev ? prev.filter((c) => c.id !== commentId) : prev));
    } else {
      window.alert("댓글 삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
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
        <Link href="/motorcycle" className="kr-btn-primary mt-8 px-6 py-2.5 text-sm">
          피드로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = session?.user.id === route.user_id;

  const typeMeta = routeTypeMeta(route.route_type);
  // winding_score 는 Postgres numeric — 문자열로 올 수 있어 Number() 로 강제.
  const windingScore = route.winding_score != null ? Number(route.winding_score) : null;
  const winding = windingScore != null ? windingGrade(windingScore) : null;

  const naverUrl =
    route.stops.length >= 2
      ? buildNaverWebRouteUrl(
          route.stops.map(
            (s): NaverRoutePoint => ({
              latitude: s.latitude,
              longitude: s.longitude,
              place_name_ko: s.name,
              sequence: s.sequence,
            })
          )
        )
      : null;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          <span>{route.region || "지역 미정"}</span>
        </div>
        {(typeMeta || route.moto_safe === true || winding !== null) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {typeMeta && (
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
                {typeMeta.emoji} {typeMeta.label}
              </span>
            )}
            {route.moto_safe === true && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-400">
                🛵 이륜차 안전 경로 · 자동차전용도로 미경유
              </span>
            )}
            {winding !== null && windingScore !== null && (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-400">
                {winding.emoji} 와인딩 지수 {windingScore} · {winding.label}
              </span>
            )}
          </div>
        )}
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{route.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-400">
          <Link
            href={`/motorcycle/riders/${route.user_id}`}
            className="transition-colors hover:text-amber-400"
          >
            {route.author_nickname}
          </Link>
          {isLoggedIn && !isAuthor && following !== null && (
            <button
              type="button"
              onClick={handleFollowToggle}
              disabled={followBusy}
              className={`disabled:opacity-60 ${
                following ? "kr-btn-secondary" : "kr-btn-primary"
              } px-3 py-1 text-xs`}
            >
              {following ? "팔로잉" : "팔로우"}
            </button>
          )}
          <span aria-hidden="true">·</span>
          <span>{relativeTimeKo(route.created_at)}</span>
          {route.distance_km != null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{route.distance_km}km</span>
            </>
          )}
          {route.duration_min != null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatDurationKo(route.duration_min)}</span>
            </>
          )}
        </div>
        {route.description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">{route.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {social && (
            <LikeButton
              routeId={route.id}
              initialCount={social.likeCount}
              initialLiked={social.likedByMe}
            />
          )}
          {naverUrl && (
            <a
              href={naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#03C75A] px-5 py-2 text-sm font-extrabold text-white shadow-md shadow-green-500/25 transition-transform active:scale-[0.98]"
            >
              <span
                className="grid h-5 w-5 place-items-center rounded-md bg-white text-xs font-black"
                style={{ color: "#03C75A" }}
              >
                N
              </span>
              네이버 지도로 길안내
            </a>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="kr-btn-secondary px-5 py-2 text-sm"
          >
            {shareCopied ? "링크 복사됨 ✓" : "공유"}
          </button>
          <button
            type="button"
            onClick={handleGpxDownload}
            title={isLoggedIn ? "GPX 파일로 내려받기" : "로그인이 필요해요"}
            className="kr-btn-secondary px-5 py-2 text-sm"
          >
            GPX 다운로드
            {!sessionLoading && !isLoggedIn && (
              <span className="ml-1.5 text-[11px] font-semibold text-slate-500">로그인 필요</span>
            )}
          </button>
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="kr-btn-danger px-5 py-2 text-sm"
            >
              {deleting ? "삭제하는 중…" : "삭제"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="krider-map-dark relative h-[320px] overflow-hidden rounded-2xl border border-[var(--kr-line-strong)] sm:h-[420px] lg:h-[520px]">
          <RouteDetailMap stops={route.stops} trackPoints={route.track_points} />
        </div>

        <div className="kr-card p-5">
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

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold text-white">
          댓글{comments !== null ? ` (${comments.length})` : ""}
        </h2>
        <div className="kr-card p-5 sm:p-6">
          {comments === null ? (
            <p className="py-4 text-center text-sm text-slate-500">댓글을 불러오는 중…</p>
          ) : comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요.
            </p>
          ) : (
            <ul className="space-y-5">
              {comments.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/motorcycle/riders/${c.user_id}`}
                      className="text-sm font-bold text-white transition-colors hover:text-amber-400"
                    >
                      {c.nickname}
                    </Link>
                    <span className="text-xs text-slate-500">{relativeTimeKo(c.created_at)}</span>
                    {session?.user.id === c.user_id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        aria-label="댓글 삭제"
                        className="ml-auto text-sm font-bold text-slate-500 transition-colors hover:text-red-400"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {!sessionLoading &&
            (isLoggedIn && profile ? (
              <form
                onSubmit={handleAddComment}
                className="mt-5 flex gap-2 border-t border-[var(--kr-line)] pt-5"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 남겨보세요"
                  maxLength={500}
                  className="kr-input min-w-0 flex-1 px-3 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentSubmitting}
                  className="kr-btn-primary shrink-0 px-4 py-2 text-sm"
                >
                  {commentSubmitting ? "등록 중…" : "등록"}
                </button>
              </form>
            ) : !isLoggedIn ? (
              <p className="mt-5 border-t border-[var(--kr-line)] pt-5 text-sm text-slate-400">
                댓글을 남기려면{" "}
                <Link href="/motorcycle/login" className="font-bold text-amber-400 hover:underline">
                  로그인
                </Link>
                하세요
              </p>
            ) : null)}
        </div>
      </section>
    </div>
  );
}
