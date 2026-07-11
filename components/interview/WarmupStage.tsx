"use client";

/* ============================================================
 * STAGE 2 — 여행 수다: 최근 여행부터 가볍게(구 대본 ② 각색).
 *   질문 카드 2장 — 큰 질문 텍스트(같이 읽기) + 빠른 캡처 칩 + 메모.
 *   진행 팁은 카드 안 <details> 로 조용히(대상자도 보는 화면).
 * ============================================================ */

import { TRAVELER_TYPES } from "@/lib/join/constants";
import type { StageProps, TypeMatch } from "./interview.types";
import { COMPANIONS, TYPE_MATCH } from "./interview.types";
import { ChipGroup, QuestionCard, TipDetails, toggleValue } from "./ui";

export default function WarmupStage({ data, patch, onNext, onBack }: StageProps) {
  const type = data.travelerTypeKey ? TRAVELER_TYPES[data.travelerTypeKey] : null;

  const typeQuestion = type
    ? `퀴즈에서 ‘${type.name}’ 나왔었죠 — 진짜 그런 편이에요?`
    : "지난번 퀴즈에서 받은 유형, 진짜 그런 편이에요?";

  return (
    <div className="join-stack">
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      <p className="join-kicker">여행 수다</p>
      <h2 className="join-h2">가볍게, 최근 여행부터</h2>

      <QuestionCard question="최근에 다녀온 여행 있어요? 어디였어요?">
        <span className="join-label" id="iv-companions-label">
          누구랑 갔어요?
        </span>
        <ChipGroup
          options={COMPANIONS}
          selected={data.companions}
          onToggle={(v) =>
            patch((prev) => ({ companions: toggleValue(prev.companions, v) }))
          }
          ariaLabel="누구랑 갔어요?"
        />
        <label className="join-label" htmlFor="iv-recent-memo">
          메모
        </label>
        <textarea
          id="iv-recent-memo"
          className="join-input"
          value={data.recentTripMemo}
          onChange={(e) => patch({ recentTripMemo: e.target.value })}
          placeholder="이야기 나온 내용을 편하게 메모"
        />
        <TipDetails tip="누구랑, 며칠, 어땠는지 가볍게 물어보세요. 가장 최근 기억이 제일 떠올리기 쉬워서, 최근 여행부터 시작하면 이야기가 자연스럽게 풀려요." />
      </QuestionCard>

      <QuestionCard question={typeQuestion}>
        <span className="join-label" id="iv-typematch-label">
          한 마디로 하면
        </span>
        <ChipGroup
          options={TYPE_MATCH}
          selected={data.typeMatch ? [data.typeMatch] : []}
          onToggle={(v) =>
            patch((prev) => ({
              typeMatch: prev.typeMatch === v ? null : (v as TypeMatch),
            }))
          }
          ariaLabel="유형 공감 여부"
        />
        <label className="join-label" htmlFor="iv-type-memo">
          메모
        </label>
        <textarea
          id="iv-type-memo"
          className="join-input"
          value={data.typeMemo}
          onChange={(e) => patch({ typeMemo: e.target.value })}
          placeholder="이야기 나온 내용을 편하게 메모"
        />
        <TipDetails tip="아이스브레이킹 겸 성향 확인이에요. ‘왜 그렇게 생각해요?’를 한 번 더 물어보면 좋아요." />
      </QuestionCard>

      <button type="button" className="join-cta" onClick={onNext}>
        기억에 남는 스팟으로 →
      </button>
    </div>
  );
}
