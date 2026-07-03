"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/lib/motorcycle/social";

interface LikeButtonProps {
  routeId: string;
  initialCount: number;
  initialLiked: boolean;
  /** 카드 하단 등 좁은 자리용 — 테두리 없는 작은 인라인 형태. */
  compact?: boolean;
}

export default function LikeButton({
  routeId,
  initialCount,
  initialLiked,
  compact,
}: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    // 카드의 오버레이 링크 위에 얹히므로 링크 이동을 막는다.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    // 낙관적 반영 — 실패 시 원복.
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setBusy(true);

    const result = await toggleLike(routeId);
    setBusy(false);

    if (!result.ok) {
      setLiked(prevLiked);
      setCount(prevCount);
      if (result.error === "not_authenticated") {
        router.push("/motorcycle/login");
      }
    }
  };

  const heart = (
    <svg
      className={compact ? "kr-heart h-4 w-4" : "kr-heart h-5 w-5"}
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={
        compact
          ? `flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              liked ? "text-amber-400" : "text-slate-400 hover:text-amber-400"
            }`
          : liked
            ? "flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 transition-colors"
            : "kr-btn-secondary px-4 py-2 text-sm"
      }
    >
      {heart}
      <span>{count}</span>
    </button>
  );
}
