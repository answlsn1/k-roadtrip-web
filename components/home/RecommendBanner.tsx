"use client";

import Link from "next/link";
import { useLangStore } from "@/store/useLangStore";

/**
 * 홈페이지 → /recommend(온라인 추천) 유도 배너.
 * 로컬 스팟 추천은 한국어 화자를 대상으로 하는 흐름이라, 한국어 토글일
 * 때만 노출한다(영어 화면 방문자에게는 응답하기 어려운 질문이라 숨김).
 *
 * Design v2: promoted from a light card to a full-bleed ink section — same
 * dark grammar as RoadTripTips, so the two dark beats bracket ValueProps and
 * this one flows straight into the ink footer as one closing passage.
 */
export default function RecommendBanner() {
  const lang = useLangStore((s) => s.lang);
  if (lang !== "ko") return null;

  return (
    <section className="bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-20 text-center sm:py-24">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          당신의 로컬 지식이 필요해요
        </p>
        <h2 className="text-xl font-extrabold text-white sm:text-2xl">
          나만 아는 그 곳, 여기 남겨주세요
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-400">
          외국인 여행자들에게 진짜 한국을 보여주고 싶어요. 다녀온 곳 중 딱 하나만
          추천해주면, 다음 코스에 반영할게요.
        </p>
        {/* Secondary CTA — the page-level primary action stays with the FAB.
            Quiet bordered pill, dark-section version of the original light card CTA. */}
        <Link
          href="/recommend?src=home_banner"
          className="mt-1 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-extrabold text-white shadow-float-dark transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          30초 추천하러 가기 →
        </Link>
      </div>
    </section>
  );
}
