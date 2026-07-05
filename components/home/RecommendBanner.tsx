"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";

/**
 * 홈페이지 → /recommend(온라인 추천) 유도 배너.
 * 로컬 스팟 추천은 한국어 화자를 대상으로 하는 흐름이라, 한국어 토글일
 * 때만 노출한다(영어 화면 방문자에게는 응답하기 어려운 질문이라 숨김).
 */
export default function RecommendBanner() {
  const lang = useLangStore((s) => s.lang);
  if (lang !== "ko") return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-7 py-10 text-center sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          당신의 로컬 지식이 필요해요
        </p>
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
          나만 아는 그 곳, 여기 남겨주세요
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-500">
          외국인 여행자들에게 진짜 한국을 보여주고 싶어요. 다녀온 곳 중 딱 하나만
          추천해주면, 다음 코스에 반영할게요.
        </p>
        {/* Secondary CTA — the page-level primary action stays with the FAB.
            Quiet bordered pill, same visual grammar as CategoryRow nav buttons. */}
        <Link
          href="/recommend?src=home_banner"
          className="mt-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-extrabold text-ink shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99]"
        >
          30초 추천하러 가기 →
        </Link>
      </div>
    </section>
  );
}
