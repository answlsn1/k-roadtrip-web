"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logIn, getMyProfile, ensureProfile } from "@/lib/motorcycle/auth";
import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import SocialAuthButtons from "@/components/motorcycle/SocialAuthButtons";

export default function MotorcycleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await logIn(email.trim(), password);
    if (!result.ok) {
      console.error("motorcycle logIn error:", result.error);
      setError("로그인에 실패했어요. 이메일과 비밀번호를 다시 확인해주세요.");
      setSubmitting(false);
      return;
    }

    const profile = await getMyProfile();
    if (!profile) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const fallbackNickname = user.email?.split("@")[0] ?? "라이더";
          await ensureProfile(user.id, fallbackNickname);
        }
      }
    }

    setSubmitting(false);
    router.push("/motorcycle");
  };

  return (
    <div className="mx-auto max-w-md px-5 py-14 sm:py-20">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
        K-Riders
      </p>
      <h1 className="mb-8 text-2xl font-extrabold text-white">로그인</h1>

      <SocialAuthButtons redirectTo="/motorcycle" />

      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="kr-input px-4 py-3 text-sm"
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
            placeholder="비밀번호"
            autoComplete="current-password"
            className="kr-input px-4 py-3 text-sm"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="kr-btn-primary w-full py-3.5 text-sm"
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        아직 계정이 없나요?{" "}
        <Link href="/motorcycle/signup" className="font-bold text-amber-400 hover:text-amber-300">
          회원가입
        </Link>
      </p>
    </div>
  );
}
