"use client";

/* ============================================================
 * 시그니처 2 — 보딩패스 티켓 (캡처·공유용)
 *   헤드라인 = 실제 MBTI 코드 + 우리가 붙인 여행 별명.
 *   그라데이션 헤더("k—roadtrip" + "0기 동행단" 스탬프, 살짝 회전) /
 *   MBTI 코드 / 큰 이모지 / 별명 / 설명 / 특징 칩 /
 *   점선 절취선 + 좌우 반원 노치(컨테이너 배경색) /
 *   하단 2칸(추천 지역=recRegion, 나의 픽=recSpot 없으면 "직접 만나서!").
 *   티켓 아래: 여행 성향 4축 요약 + 잘 맞는 여행 메이트.
 *   등장 시 pop 애니메이션(reduced-motion 가드).
 * ============================================================ */

import { TRAVEL_AXES, getTravelerType } from "@/lib/join/constants";
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
  const type = getTravelerType(answers.mbti);

  // MBTI 를 끝내 안 고른 경우(추정 문항도 중간에 그만둔 경우) 안전 폴백.
  const emoji = type?.emoji ?? "🧳";
  const name = type?.name ?? "0기 동행단";
  const desc = type?.desc ?? "당신만의 여행 스타일을 담은 유형";
  const code = type?.code ?? null;
  const traits = type?.traits ?? [];
  const mate = getTravelerType(type?.mate);

  const recRegion = answers.recRegion ?? "—";
  const myPick = answers.recSpot.trim() || "직접 만나서!";

  // 여행 성향 4축 — 답한 축만 보여준다(중간에 그만뒀을 수 있음).
  const travelValues = [
    answers.plan,
    answers.spotPref,
    answers.pace,
    answers.focus,
  ];

  return (
    <div className="join-stack">
      {/* ⚠️ 여기에 role="img" 를 걸면 안 된다 — role="img" 는 서브트리를
          접근성 트리에서 통째로 지우는 역할이라(Children Presentational),
          안에 있는 설명·특징칩·추천지역·나의 픽이 전부 안 읽힌다.
          시각적으로 "한 장의 티켓" 인 건 CSS 로 충분하고,
          장식 요소(이모지·절취선·코드 표기)에만 aria-hidden 을 건다. */}
      <div className={`ticket${reduced ? "" : " ticket--pop"}`}>
        <div className="ticket-header">
          <span className="ticket-brand">k—roadtrip</span>
          <span className="ticket-stamp">0기 동행단</span>
        </div>

        <div className="ticket-body">
          {code && (
            <>
              {/* 화면엔 'ENFP' 로 붙여 보여주고, 스크린리더엔 한 글자씩 띄어 읽힌다
                  (안 그러면 'ENFP' 를 한 단어로 뭉개 읽는다). */}
              <div className="ticket-code" aria-hidden="true">
                {code}
              </div>
              <span className="join-sr-only">
                MBTI {code.split("").join(" ")}
              </span>
            </>
          )}
          <div className="ticket-emoji" aria-hidden="true">
            {emoji}
          </div>
          <div className="ticket-type">{name}</div>
          <div className="ticket-desc">{desc}</div>
          {traits.length > 0 && (
            <ul className="ticket-traits" aria-label="유형 특징">
              {traits.map((t) => (
                <li key={t} className="ticket-trait">
                  {t}
                </li>
              ))}
            </ul>
          )}
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

      {/* 여행 성향 — MBTI 는 성격, 이쪽은 "여행할 때의 나". */}
      {travelValues.some(Boolean) && (
        <div className="typelegend">
          <div className="typelegend-title">여행할 때의 나</div>
          <ul className="typelegend-list">
            {TRAVEL_AXES.map((axis, i) => {
              const value = travelValues[i];
              if (!value) return null;
              const other = axis.values.find((v) => v !== value);
              return (
                <li key={axis.label} className="typelegend-row">
                  <span className="typelegend-letter">{value}</span>
                  <span className="typelegend-text">
                    <span className="typelegend-hint">{axis.label}</span>
                    <span className="join-sr-only">
                      {` (반대: ${other})`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 잘 맞는 메이트 — 앞 세 글자는 같고 계획/즉흥(J·P)만 반대인 유형. */}
      {mate && (
        <div className="typemate">
          <span className="typemate-emoji" aria-hidden="true">
            {mate.emoji}
          </span>
          <span className="typemate-text">
            <span className="typemate-k">잘 맞는 여행 메이트</span>
            <span className="typemate-v">
              {mate.name} <span className="typemate-code">{mate.code}</span>
            </span>
          </span>
        </div>
      )}

      <p className="join-micro" style={{ textAlign: "center" }}>
        당신이 알려준 스팟, 실제 {joinConfig.appName}에 <strong>‘내 별명’으로
        등록</strong>될 수도 있어요.
        <br />📸 캡처해서 자랑하기
      </p>

      <button type="button" className="join-cta" onClick={onNext}>
        왜 내 도움이 필요한지 보기 →
      </button>
    </div>
  );
}
