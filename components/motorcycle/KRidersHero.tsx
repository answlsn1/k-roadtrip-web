"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ============================================================
 * 시네마틱 히어로 — 제네시스 공식 웹 벤치마킹.
 *   풀블리드 라이딩 이미지 슬라이드쇼(느린 크로스페이드 1.2s + 켄번즈)
 *   위에 좌하단 타이틀 블록. 스크림 하단이 페이지 배경(#0c0e12)으로
 *   완전히 수렴해 피드와 이음새 없이 이어진다.
 *   켄번즈는 active 클래스로 애니메이션을 붙였다 뗐다 하지 않고, 항상
 *   재생 중(22s alternate infinite)인 채로 active 여부에 따라 재생/일시
 *   정지만 토글한다 — 애니메이션을 제거하면 transform 이 즉시 scale(1)로
 *   리셋돼 크로스페이드 도중 화면이 훅 끊기므로(motorcycle.css 참조).
 *   이미지는 전부 실사진(Unsplash 핫링크, 배포 시점 HTTP 200 검증) —
 *   메인 사이트 HeroSlideshow 와 동일한 미디어 정책.
 *   reduced-motion: 회전·켄번즈 정지, 첫 장 고정(메인 사이트와 동일 규약).
 * ============================================================ */

interface Slide {
  src: string;
  alt: string;
  /** object-position — 세로로 매우 넓게 잘리는 데스크톱 레터박스에서도
   *  라이더/피사체가 잘리지 않도록 사진마다 개별 지정(제네시스 히어로와
   *  동일 기법, HeroSlideshow.tsx 참조). */
  focus: string;
}

const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1771427795503-74fa80babf5d?auto=format&fit=crop&w=2000&q=75",
    alt: "구름 위 고갯길을 달리는 두 명의 모터사이클 라이더",
    focus: "center 85%",
  },
  {
    src: "https://images.unsplash.com/photo-1763568088984-e6a507ab4219?auto=format&fit=crop&w=2000&q=75",
    alt: "",
    focus: "center 40%",
  },
  {
    src: "https://images.unsplash.com/photo-1761415476148-4637cc80d5d0?auto=format&fit=crop&w=2000&q=75",
    alt: "",
    focus: "center 35%",
  },
  {
    src: "https://images.unsplash.com/photo-1770614956862-a143fb5e4921?auto=format&fit=crop&w=2000&q=75",
    alt: "",
    focus: "center 74%",
  },
  {
    src: "https://images.unsplash.com/photo-1582084770885-36767753763d?auto=format&fit=crop&w=2000&q=75",
    alt: "",
    focus: "center 52%",
  },
  {
    src: "https://images.unsplash.com/photo-1768410318116-9b6bcb7ec927?auto=format&fit=crop&w=2000&q=75",
    alt: "",
    focus: "center 55%",
  },
];

const ROTATE_MS = 6000;

export default function KRidersHero({
  showAuthCta,
  showRiderCta,
}: {
  /** 로그아웃 상태 — 가입/로그인 CTA. */
  showAuthCta: boolean;
  /** 로그인 상태 — 주행 기록/루트 등록 CTA. */
  showRiderCta: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduced, index]);

  const active = reduced ? 0 : index;

  return (
    <section className="relative h-[58vh] min-h-[420px] max-h-[640px] w-full overflow-hidden">
      {/* 이미지 스택 */}
      {SLIDES.map((slide, i) => {
        const isActive = i === active;
        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={`kr-hero-slide absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              isActive ? "kr-hero-slide-active opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className="h-full w-full object-cover"
              style={{ objectPosition: slide.focus }}
            />
          </div>
        );
      })}

      {/* 스크림 — 하단이 페이지 배경으로 수렴 */}
      <div className="kr-hero-scrim absolute inset-0" />

      {/* 타이틀 블록 — 좌하단 */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-6xl px-5 pb-10 sm:pb-14">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
            K-Riders
          </p>
          <h1 className="kr-balance text-3xl font-bold leading-[1.18] tracking-tight text-white sm:text-5xl">
            오늘 달린 길,
            <br />
            라이더들과 나눠보세요
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
            내가 달린 라이딩 루트를 기록하고, 다른 라이더들이 남긴 길을 발견하세요.
          </p>

          {showAuthCta && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/motorcycle/signup" className="kr-btn-primary px-6 py-3 text-sm">
                지금 시작하기
              </Link>
              <Link href="/motorcycle/login" className="kr-btn-secondary px-6 py-3 text-sm">
                로그인
              </Link>
            </div>
          )}
          {showRiderCta && (
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/motorcycle/record" className="kr-btn-primary px-6 py-3 text-sm">
                주행 기록 시작
              </Link>
              <Link href="/motorcycle/routes/new" className="kr-btn-secondary px-6 py-3 text-sm">
                루트 등록
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 슬라이드 인디케이터 — 우하단 */}
      <div className="absolute bottom-5 right-5 flex gap-2 sm:bottom-8 sm:right-8">
        {SLIDES.map((_, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번 슬라이드로 이동`}
              aria-current={isActive ? "true" : undefined}
              className="-m-1.5 p-1.5"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  isActive ? "w-6 bg-amber-400" : "w-2.5 bg-white/35"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
