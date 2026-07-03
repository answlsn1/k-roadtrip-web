"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BOARD_CATEGORIES, createPost } from "@/lib/motorcycle/board";
import type { BoardCategory } from "@/lib/motorcycle/board";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";

const RATE_LIMIT_MESSAGE =
  "도배 방지를 위해 잠시 후 다시 시도해주세요. 같은 내용을 반복해서 올릴 수는 없어요.";

export default function NewBoardPostPage() {
  const router = useRouter();
  const { profile, isLoggedIn, loading } = useMotorcycleSession();

  const [category, setCategory] = useState<BoardCategory>("chat");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  const canSubmit = title.trim().length >= 2 && body.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting || !profile) return;

    setSubmitting(true);
    setError(null);
    const result = await createPost({
      category,
      title: title.trim(),
      body: body.trim(),
      nickname: profile.nickname,
    });
    setSubmitting(false);

    if (result.ok) {
      router.push(`/motorcycle/board/${result.id}`);
      return;
    }
    if (result.error === "rate_limited") {
      setError(RATE_LIMIT_MESSAGE);
    } else if (result.error === "not_authenticated") {
      router.push("/motorcycle/login");
    } else {
      setError("글 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          라이더챗 게시판
        </p>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">새 글 쓰기</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <span className="mb-2 block text-sm font-semibold text-slate-300">말머리</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="말머리 선택">
            {BOARD_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                  category === c.value
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
                    : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-300">
            제목
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 이번 주말 미시령 같이 달리실 분?"
            maxLength={100}
            className="kr-input px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-1.5 block text-sm font-semibold text-slate-300">
            내용
          </label>
          <textarea
            id="body"
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="라이더들과 나누고 싶은 이야기를 적어보세요"
            rows={10}
            maxLength={5000}
            className="kr-input resize-y px-4 py-3 text-sm leading-relaxed"
          />
          <p className="mt-1 text-right text-xs text-slate-500">{body.length}/5000</p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!canSubmit || submitting || !profile}
            className="kr-btn-primary w-full py-3.5 text-sm"
          >
            {submitting ? "등록 중…" : "등록"}
          </button>
          <Link
            href="/motorcycle/board"
            className="shrink-0 text-sm font-semibold text-slate-400 transition-colors hover:text-amber-400"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
