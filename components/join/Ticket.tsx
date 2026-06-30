"use client";

/* ============================================================
 * 시그니처 2 — 보딩패스 티켓 (캡처·공유용)
 *   resolveTravelerType(plan, spotPref) 로 유형 산출.
 *   그라데이션 헤더("k—roadtrip" + "0기 동행단" 스탬프, 살짝 회전) /
 *   큰 이모지 / 유형명 / 설명 / 점선 절취선 + 좌우 반원 노치(컨테이너 배경색) /
 *   하단 2칸(추천 지역=recRegion, 나의 픽=recSpot 없으면 "직접 만나서!").
 *   등장 시 pop 애니메이션(reduced-motion 가드).
 * ============================================================ */

import { resolveTravelerType } from "@/lib/join/constants";
import { joinConfig } from "@/lib/join/config";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { JoinAnswers } from "./join.flow.types";

export default function Ticket({
  answers,
  onNext,
}: {
  answers: JoinAnswers;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const type = resolveTravelerType(answers.plan, answers.spotPref);

  // resolveTravelerType 은 둘 중 하나라도 null 이면 null → 안전 폴백.
  const emoji = type?.emoji ?? "🧳";
  const name = type?.name ?? "0기 동행단";
  const desc = type?.desc ?? "당신만의 여행 스타일을 가진 타입";

  const recRegion = answers.recRegion ?? "—";
  const myPick = answers.recSpot.trim() || "직접 만나서!";

  return (
    <div className="join-stack">
      <div
        className={`ticket${reduced ? "" : " ticket--pop"}`}
        role="img"
        aria-label={`여행자 유형 탑승권: ${name}`}
      >
        <div className="ticket-header">
          <span className="ticket-brand">k—roadtrip</span>
          <span className="ticket-stamp">0기 동행단</span>
        </div>

        <div className="ticket-body">
          <div className="ticket-emoji" aria-hidden="true">
            {emoji}
          </div>
          <div className="ticket-type">{name}</div>
          <div className="ticket-desc">{desc}</div>
        </div>

        <div className="ticket-perforation" aria-hidden="true">
          <span className="ticket-notch ticket-notch--left" />
          <span className="ticket-notch ticket-notch--right" />
        </div>

        <div className="ticket-meta">
          <div className="ticket-meta-item">
            <div className="ticket-meta-k">추천 지역</div>
            <div className="ticket-meta-v">{recRegion}</div>
          </div>
          <div className="ticket-meta-item">
            <div className="ticket-meta-k">나의 픽</div>
            <div className="ticket-meta-v">{myPick}</div>
          </div>
        </div>
      </div>

      <p className="join-micro" style={{ textAlign: "center" }}>
        이 추천, 실제 {joinConfig.appName}에 반영될 수도 있어요.
        <br />📸 캡처해서 친구한테 자랑하기
      </p>

      <button type="button" className="join-cta" onClick={onNext}>
        왜 내 도움이 필요한지 보기 →
      </button>
    </div>
  );
}
