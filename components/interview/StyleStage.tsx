"use client";

/* ============================================================
 * STAGE 4 — 여행 방식 + 불편(구 대본 ④ 각색).
 *   정보 출처 다중 선택 + 답답했던 것(PAINS 단일 소스) 다중 선택 + 메모.
 * ============================================================ */

import { PAINS } from "@/lib/join/constants";
import type { StageProps } from "./interview.types";
import { SOURCES } from "./interview.types";
import { ChipGroup, QuestionCard, TipDetails, toggleValue } from "./ui";

export default function StyleStage({ data, patch, onNext, onBack }: StageProps) {
  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      <p className="join-kicker">여행 방식</p>
      <h2 className="join-h2">여행, 어떻게 만들어요?</h2>

      <QuestionCard question="여행 계획 짤 때 정보 어디서 찾아요?">
        <div style={{ marginTop: 14 }}>
          <ChipGroup
            options={SOURCES}
            selected={data.sources}
            onToggle={(v) =>
              patch((prev) => ({ sources: toggleValue(prev.sources, v) }))
            }
            ariaLabel="정보를 찾는 곳"
          />
        </div>
      </QuestionCard>

      <QuestionCard question="계획하거나 다니면서 제일 답답했던 건 뭐였어요?">
        <div style={{ marginTop: 14 }}>
          <ChipGroup
            options={PAINS}
            selected={data.pains}
            onToggle={(v) =>
              patch((prev) => ({ pains: toggleValue(prev.pains, v) }))
            }
            ariaLabel="답답했던 것"
          />
        </div>
        <label className="join-label" htmlFor="iv-style-memo">
          메모
        </label>
        <textarea
          id="iv-style-memo"
          className="join-input"
          value={data.styleMemo}
          onChange={(e) => patch({ styleMemo: e.target.value })}
          placeholder="이야기 나온 내용을 편하게 메모"
        />
        <TipDetails tip="‘제일 귀찮았던 순간 하나만 꼽으면?’처럼 구체적으로 물으면 진짜 불편이 나와요. 현지에서 겪은 불편(교통·주차·정보 흩어짐·예약)도 함께." />
      </QuestionCard>

      <button type="button" className="join-cta" onClick={onNext}>
        마지막 이야기로 →
      </button>
    </div>
  );
}
