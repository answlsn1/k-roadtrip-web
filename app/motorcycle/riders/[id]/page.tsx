"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getProfileById,
  getRiderStats,
  listRoutesByUser,
} from "@/lib/motorcycle/profile";
import {
  getFollowCounts,
  getSocialForRoutes,
  followRider,
  unfollowRider,
  isFollowing,
} from "@/lib/motorcycle/social";
import type {
  MotorcycleProfile,
  MotorcycleRouteWithAuthor,
  RouteSocial,
} from "@/lib/motorcycle/types";
import { RIDER_BADGES } from "@/lib/motorcycle/badges";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import RouteCard from "@/components/motorcycle/RouteCard";

interface RiderData {
  profile: MotorcycleProfile | null;
  stats: { routeCount: number; totalKm: number };
  counts: { followers: number; following: number };
  routes: MotorcycleRouteWithAuthor[];
}

export default function RiderProfilePage() {
  const params = useParams<{ id: string }>();
  const { session, isLoggedIn } = useMotorcycleSession();

  const [data, setData] = useState<RiderData | undefined>(undefined);
  const [social, setSocial] = useState<Record<string, RouteSocial> | null>(null);
  const [following, setFollowing] = useState<boolean | null>(null);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      getProfileById(params.id),
      getRiderStats(params.id),
      getFollowCounts(params.id),
      listRoutesByUser(params.id),
    ]).then(([profile, stats, counts, routes]) => {
      setData({ profile, stats, counts, routes });
      getSocialForRoutes(routes.map((r) => r.id)).then(setSocial);
    });
  }, [params.id]);

  useEffect(() => {
    if (!params.id || !session) return;
    if (session.user.id === params.id) return;
    isFollowing(params.id).then(setFollowing);
  }, [params.id, session]);

  const handleFollowToggle = async () => {
    if (!params.id || following === null || followBusy) return;
    // 낙관적 반영 — 팔로워 수도 함께 움직이고, 실패 시 원복.
    const prev = following;
    const next = !prev;
    setFollowing(next);
    setData((d) =>
      d
        ? { ...d, counts: { ...d.counts, followers: d.counts.followers + (next ? 1 : -1) } }
        : d
    );
    setFollowBusy(true);
    const result = prev ? await unfollowRider(params.id) : await followRider(params.id);
    setFollowBusy(false);
    if (!result.ok) {
      setFollowing(prev);
      setData((d) =>
        d
          ? { ...d, counts: { ...d.counts, followers: d.counts.followers + (next ? -1 : 1) } }
          : d
      );
    }
  };

  if (data === undefined) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">불러오는 중…</div>;
  }

  if (data.profile === null) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-extrabold text-white">라이더를 찾을 수 없어요</h1>
        <p className="mt-3 text-sm text-slate-400">탈퇴했거나 존재하지 않는 라이더예요.</p>
        <Link
          href="/motorcycle"
          className="mt-8 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink"
        >
          피드로 돌아가기
        </Link>
      </div>
    );
  }

  const { profile, stats, counts, routes } = data;
  const isMe = session?.user.id === profile.id;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24">
      <div className="flex flex-col items-center gap-6 py-10 text-center sm:flex-row sm:items-start sm:py-14 sm:text-left">
        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-amber-500 text-4xl font-black text-ink">
          {profile.nickname.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{profile.nickname}</h1>
            {isMe ? (
              <Link
                href="/motorcycle/me/edit"
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              >
                프로필 수정
              </Link>
            ) : (
              isLoggedIn &&
              following !== null && (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-colors disabled:opacity-60 ${
                    following
                      ? "border border-white/15 text-slate-300 hover:border-red-500/40 hover:text-red-400"
                      : "bg-amber-500 text-ink hover:bg-amber-400"
                  }`}
                >
                  {following ? "팔로잉" : "팔로우"}
                </button>
              )
            )}
          </div>

          {profile.bike_model && (
            <p className="mt-1.5 text-sm font-semibold text-slate-300">
              <span aria-hidden="true">🏍</span> {profile.bike_model}
            </p>
          )}
          {profile.bio && (
            <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-slate-400">
              {profile.bio}
            </p>
          )}

          <div className="mt-4 flex justify-center gap-5 text-sm font-semibold text-slate-400 sm:justify-start">
            <span>
              <b className="font-extrabold text-white">{counts.followers}</b> 팔로워
            </span>
            <span>
              <b className="font-extrabold text-white">{counts.following}</b> 팔로잉
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4">
        <p className="text-sm font-extrabold text-white">
          루트 {stats.routeCount}개 <span aria-hidden="true" className="text-slate-500">·</span> 총{" "}
          {stats.totalKm}km
        </p>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold text-white">배지</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {RIDER_BADGES.map((badge) => {
            const earned = badge.earned(stats);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 text-center ${
                  earned
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-white/10 bg-white/5 opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl" aria-hidden="true">
                  {badge.emoji}
                </div>
                <p className="mt-2 text-sm font-extrabold text-white">{badge.name}</p>
                <p className="mt-0.5 text-xs leading-snug text-slate-400">{badge.condition}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold text-white">
          {isMe ? "내 루트" : `${profile.nickname}님의 루트`}
        </h2>
        {routes.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-base font-bold text-white">아직 공개된 루트가 없어요</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                social={social?.[route.id]}
                showVisibility={isMe}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
