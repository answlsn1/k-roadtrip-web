"use client";

/* ============================================================
 * STAGE 1 — 만남: 여기서부터 화면을 함께 본다.
 *   이름을 부르는 큰 환영 인사 + "여행 수다" 계약 명시 +
 *   메모 동의 토글(.join-toggle) + 길거리에서 받았던 보딩패스 티켓을
 *   그대로 다시 보여주는 콜백(라포의 핵심 순간).
 * ============================================================ */

import { TRAVELER_TYPES } from "@/lib/join/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { StageProps } from "./interview.types";

export default function WelcomeStage({ data, patch, onNext, onBack }: StageProps) {
  const reduced = useReducedMotion();
  const type = data.travelerTypeKey ? TRAVELER_TYPES[data.travelerTypeKey] : null;
  const name = data.name.trim() || "동행자";

  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 준비로
      </button>

      <h1 className="join-h1">{name}님, 와줘서 고마워요 ☕</h1>
      <p className="join-lead">
        오늘은 인터뷰라기보다 <strong>여행 수다</strong>예요. 정답은 없어요.
        생각나는 대로 편하게 이야기해 주세요.
      </p>

      {/* 메모 동의 — 대상자가 직접 보고 켜는 토글(투명한 동의) */}
      <button
        type="button"
        className="join-toggle"
        aria-pressed={data.consent}
        onClick={() => patch((prev) => ({ consent: !prev.consent }))}
      >
        <span className="join-toggle-emoji" aria-hidden="true">
          📝
        </span>
        <div>
          <div className="join-toggle-title">정리를 위해 메모해도 괜찮아요</div>
          <div className="join-toggle-body">
            이야기한 내용은 좋은 코스를 만드는 데만 써요. 원하면 언제든 지워
            드릴게요.
          </div>
        </div>
        <span className="join-toggle-check" aria-hidden="true">
          {data.consent ? "✓" : ""}
        </span>
      </button>

      {/* 길거리 퀴즈 보딩패스 콜백 — components/join/Ticket 과 동일 마크업 */}
      {type && (
        <div>
          <p className="join-label">지난번에 받은 탑승권, 기억나요?</p>
          <div
            className={`ticket${reduced ? "" : " ticket--pop"}`}
            role="img"
            aria-label={`여행자 유형 탑승권: ${type.name}`}
          >
            <div className="ticket-header">
              <span className="ticket-brand">k—roadtrip</span>
              <span className="ticket-stamp">0기 동행단</span>
            </div>

            <div className="ticket-body">
              <div className="ticket-emoji" aria-hidden="true">
                {type.emoji}
              </div>
              <div className="ticket-type">{type.name}</div>
              <div className="ticket-desc">{type.desc}</div>
            </div>

            <div className="ticket-perforation" aria-hidden="true">
              <span className="ticket-notch ticket-notch--left" />
              <span className="ticket-notch ticket-notch--right" />
            </div>

            <div className="ticket-meta">
              <div className="ticket-meta-item">
                <div className="ticket-meta-k">탑승자</div>
                <div className="ticket-meta-v">{name}님</div>
              </div>
              <div className="ticket-meta-item">
                <div className="ticket-meta-k">오늘의 정차역</div>
                <div className="ticket-meta-v">여행 수다 ☕</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button type="button" className="join-cta" onClick={onNext}>
        여행 수다 시작 →
      </button>
    </div>
  );
}
