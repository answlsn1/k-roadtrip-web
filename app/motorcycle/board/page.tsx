"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOARD_CATEGORIES, boardCategoryLabel, listPosts } from "@/lib/motorcycle/board";
import type { BoardCategory, MotorcyclePostListItem } from "@/lib/motorcycle/board";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";
import RiderChatTabs from "@/components/motorcycle/RiderChatTabs";

export default function MotorcycleBoardPage() {
  const [posts, setPosts] = useState<MotorcyclePostListItem[] | null>(null);
  const [category, setCategory] = useState<BoardCategory | null>(null);
  const { isLoggedIn } = useMotorcycleSession();

  useEffect(() => {
    let cancelled = false;
    setPosts(null);
    listPosts(category).then((fetched) => {
      if (!cancelled) setPosts(fetched);
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const writeHref = isLoggedIn ? "/motorcycle/board/new" : "/motorcycle/login";

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <div className="flex items-end justify-between gap-4 py-10 sm:py-14">
        <RiderChatTabs active="board" />
        <Link
          href={writeHref}
          className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-xs font-extrabold text-ink transition-transform active:scale-[0.98] sm:text-sm"
        >
          글쓰기
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="말머리 필터">
        <button
          type="button"
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
            category === null
              ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
              : "border-white/15 text-slate-400 hover:text-white"
          }`}
        >
          전체
        </button>
        {BOARD_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(category === c.value ? null : c.value)}
            aria-pressed={category === c.value}
            className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
              category === c.value
                ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                : "border-white/15 text-slate-400 hover:text-white"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {posts === null ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="divide-y divide-white/10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse px-4 py-4 sm:px-5">
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-2.5 h-3 w-1/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-base font-bold text-white">아직 글이 없어요. 첫 글을 남겨보세요.</p>
          <Link
            href={writeHref}
            className="mt-5 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink transition-transform active:scale-[0.98]"
          >
            글쓰기
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/motorcycle/board/${post.id}`}
                className="block px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5"
              >
                <p className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                    {boardCategoryLabel(post.category)}
                  </span>
                  <span className="truncate text-sm font-bold text-white">{post.title}</span>
                  {post.commentCount > 0 && (
                    <span className="shrink-0 text-sm font-bold text-amber-400">
                      ({post.commentCount})
                    </span>
                  )}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">{post.nickname}</span>
                  <span aria-hidden="true">·</span>
                  <span>{relativeTimeKo(post.created_at)}</span>
                  {post.likeCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>❤ {post.likeCount}</span>
                    </>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
