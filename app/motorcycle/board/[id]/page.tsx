"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  addPostComment,
  boardCategoryLabel,
  deletePost,
  deletePostComment,
  getPost,
  getPostSocial,
  listPostComments,
  reportContent,
  togglePostLike,
} from "@/lib/motorcycle/board";
import type { MotorcyclePost, MotorcyclePostComment } from "@/lib/motorcycle/board";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { relativeTimeKo } from "@/lib/motorcycle/relativeTime";
import RiderChatTabs from "@/components/motorcycle/RiderChatTabs";

const RATE_LIMIT_MESSAGE =
  "도배 방지를 위해 잠시 후 다시 시도해주세요. 같은 내용을 반복해서 올릴 수는 없어요.";

/** LikeButton 의 낙관적 반영 패턴을 게시글용으로 미러링 — 실패 시 원복. */
function PostLikeButton({
  postId,
  initialCount,
  initialLiked,
}: {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));
    setBusy(true);

    const result = await togglePostLike(postId);
    setBusy(false);

    if (!result.ok) {
      setLiked(prevLiked);
      setCount(prevCount);
      if (result.error === "not_authenticated") {
        router.push("/motorcycle/login");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
        liked
          ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
          : "border-white/15 text-slate-300 hover:border-amber-500/50 hover:text-amber-400"
      }`}
    >
      <svg
        className="h-5 w-5"
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
      <span>{count}</span>
    </button>
  );
}

export default function BoardPostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { session, profile, isLoggedIn, loading: sessionLoading } = useMotorcycleSession();

  const [post, setPost] = useState<MotorcyclePost | null | undefined>(undefined);
  const [social, setSocial] = useState<{ likeCount: number; likedByMe: boolean } | null>(null);
  const [comments, setComments] = useState<MotorcyclePostComment[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPost(id).then(setPost);
    getPostSocial(id).then(setSocial);
    listPostComments(id).then(setComments);
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;

    setDeleting(true);
    const ok = await deletePost(post.id);
    setDeleting(false);

    if (ok) {
      router.push("/motorcycle/board");
    } else {
      window.alert("삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleReport = async () => {
    if (!post) return;
    const reason = window.prompt("신고 사유를 알려주세요 (선택)");
    if (reason === null) return;

    const result = await reportContent("post", post.id, reason);
    if (result.ok) {
      window.alert("신고가 접수됐어요. 확인 후 조치할게요.");
    } else if (result.error === "already_exists") {
      window.alert("이미 신고한 글이에요.");
    } else if (result.error === "rate_limited") {
      window.alert(RATE_LIMIT_MESSAGE);
    } else {
      window.alert("신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !profile || commentSubmitting) return;
    const text = commentText.trim();
    if (!text) return;

    setCommentSubmitting(true);
    setCommentError(null);
    const result = await addPostComment(post.id, profile.nickname, text);
    setCommentSubmitting(false);

    if (result.ok && result.comment) {
      const added = result.comment;
      setComments((prev) => (prev ? [...prev, added] : [added]));
      setCommentText("");
    } else if (result.error === "rate_limited") {
      setCommentError(RATE_LIMIT_MESSAGE);
    } else {
      window.alert("댓글 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("이 댓글을 삭제할까요?")) return;
    const ok = await deletePostComment(commentId);
    if (ok) {
      setComments((prev) => (prev ? prev.filter((c) => c.id !== commentId) : prev));
    } else {
      window.alert("댓글 삭제에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">
        불러오는 중…
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="text-xl font-extrabold text-white">글을 찾을 수 없어요</h1>
        <p className="mt-3 text-sm text-slate-400">삭제되었거나 존재하지 않는 글이에요.</p>
        <Link
          href="/motorcycle/board"
          className="mt-8 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const isAuthor = session?.user.id === post.user_id;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <div className="flex items-start justify-between gap-4">
          <RiderChatTabs active="board" />
          <Link
            href="/motorcycle/board"
            className="shrink-0 text-sm font-semibold text-slate-400 transition-colors hover:text-amber-400"
          >
            ← 목록으로
          </Link>
        </div>

        <div className="mt-8">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
            {boardCategoryLabel(post.category)}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold leading-snug text-white">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-400">
            <Link
              href={`/motorcycle/riders/${post.user_id}`}
              className="transition-colors hover:text-amber-400"
            >
              {post.nickname}
            </Link>
            <span aria-hidden="true">·</span>
            <span>{relativeTimeKo(post.created_at)}</span>
          </div>
        </div>

        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-300 sm:text-base">
          {post.body}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {social && (
            <PostLikeButton
              postId={post.id}
              initialCount={social.likeCount}
              initialLiked={social.likedByMe}
            />
          )}
          {isLoggedIn && !isAuthor && (
            <button
              type="button"
              onClick={handleReport}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-slate-200 transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              신고
            </button>
          )}
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full border border-red-500/40 px-5 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-40"
            >
              {deleting ? "삭제하는 중…" : "삭제"}
            </button>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-extrabold text-white">
          댓글{comments !== null ? ` (${comments.length})` : ""}
        </h2>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:rounded-3xl sm:p-6">
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
              <div className="mt-5 border-t border-white/10 pt-5">
                {commentError && (
                  <div
                    role="alert"
                    className="mb-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400"
                  >
                    {commentError}
                  </div>
                )}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="댓글을 남겨보세요"
                    maxLength={500}
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commentSubmitting}
                    className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-ink transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {commentSubmitting ? "등록 중…" : "등록"}
                  </button>
                </form>
              </div>
            ) : !isLoggedIn ? (
              <p className="mt-5 border-t border-white/10 pt-5 text-sm text-slate-400">
                댓글을 남기려면{" "}
                <Link
                  href="/motorcycle/login"
                  className="font-bold text-amber-400 hover:underline"
                >
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
