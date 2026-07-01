"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/motorcycle/auth";

export default function MotorcycleSignupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const canSubmit =
    nickname.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    if (password !== confirmPassword) {
      setError("비밀번호가 서로 달라요. 다시 확인해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await signUp(email.trim(), password, nickname.trim());
    setSubmitting(false);

    if (!result.ok) {
      console.error("motorcycle signUp error:", result.error);
      setError("회원가입에 실패했어요. 이메일 형식이나 비밀번호 길이를 확인해주세요.");
      return;
    }

    if (result.hasSession) {
      // 이메일 확인이 꺼져 있는 프로젝트 설정 — 가입과 동시에 로그인된 상태.
      router.push("/motorcycle");
      return;
    }

    setNeedsEmailConfirm(true);
  };

  if (needsEmailConfirm) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/15 text-2xl">
          ✉️
        </div>
        <h1 className="mt-6 text-xl font-extrabold text-white">이메일을 확인해주세요</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {email} 주소로 확인 메일을 보냈어요. 메일함에서 링크를 눌러 인증을 마치면
          바로 로그인할 수 있어요.
        </p>
        <Link
          href="/motorcycle/login"
          className="mt-8 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-ink"
        >
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
        K-Riders
      </p>
      <h1 className="mb-8 text-2xl font-extrabold text-white">라이더 회원가입</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="nickname" className="mb-1.5 block text-sm font-semibold text-slate-300">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="라이딩할 때 불릴 이름"
            maxLength={40}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-300">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-300">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-300">
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="mt-1.5 text-xs font-semibold text-red-400">비밀번호가 일치하지 않아요.</p>
          )}
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-extrabold text-ink transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "가입하는 중…" : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        이미 계정이 있나요?{" "}
        <Link href="/motorcycle/login" className="font-bold text-amber-400 hover:text-amber-300">
          로그인
        </Link>
      </p>
    </div>
  );
}
