"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotorcycleSession } from "@/lib/motorcycle/useSession";
import { updateMyProfile } from "@/lib/motorcycle/profile";

const BIO_MAX = 300;

export default function EditMyProfilePage() {
  const router = useRouter();
  const { session, profile, isLoggedIn, loading } = useMotorcycleSession();

  const [nickname, setNickname] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bio, setBio] = useState("");
  const [seeded, setSeeded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/motorcycle/login");
    }
  }, [loading, isLoggedIn, router]);

  // 프로필이 비동기로 도착하므로 최초 1회만 폼에 채운다(입력 중 덮어쓰기 방지).
  useEffect(() => {
    if (profile && !seeded) {
      setNickname(profile.nickname);
      setBikeModel(profile.bike_model ?? "");
      setBio(profile.bio ?? "");
      setSeeded(true);
    }
  }, [profile, seeded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !nickname.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await updateMyProfile({
      nickname: nickname.trim(),
      bike_model: bikeModel.trim() || null,
      bio: bio.trim() || null,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError("프로필 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    router.push(`/motorcycle/riders/${session.user.id}`);
  };

  if (loading || !isLoggedIn) {
    return <div className="mx-auto max-w-md px-5 py-20 text-center text-sm text-slate-500">확인 중…</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-5 pb-24">
      <div className="py-10 sm:py-14">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-500">
          프로필 수정
        </p>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          라이더 프로필을 다듬어보세요
        </h1>
      </div>

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
            placeholder="예: 미시령바람"
            maxLength={40}
            className="kr-input px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label htmlFor="bikeModel" className="mb-1.5 block text-sm font-semibold text-slate-300">
            바이크 기종 (선택)
          </label>
          <input
            id="bikeModel"
            type="text"
            value={bikeModel}
            onChange={(e) => setBikeModel(e.target.value)}
            placeholder="예: 혼다 CB650R"
            maxLength={80}
            className="kr-input px-4 py-3 text-sm"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="bio" className="text-sm font-semibold text-slate-300">
              소개 (선택)
            </label>
            <span className="text-xs font-semibold text-slate-500">
              {bio.length}/{BIO_MAX}
            </span>
          </div>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="어떤 라이딩을 좋아하는지, 주로 달리는 지역을 소개해주세요"
            maxLength={BIO_MAX}
            rows={5}
            className="kr-input resize-none px-4 py-3 text-sm"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!nickname.trim() || submitting}
          className="kr-btn-primary w-full py-3.5 text-sm"
        >
          {submitting ? "저장하는 중…" : "프로필 저장"}
        </button>
      </form>
    </div>
  );
}
