"use client";

/* ============================================================
 * (2) quiz — 4스텝
 *   Step1 plan / Step2 spotPref : 큰 선택카드, 선택 즉시 자동 진행.
 *   Step3 rec   : region chips(단일) + recSpot 텍스트, region 선택 시 다음 활성화.
 *   Step4 pain  : pain chips(단일) + painText 텍스트, "내 탑승권 받기".
 *   각 스텝 좌상단 뒤로가기(Step1→hero). RouteBar 는 JoinFlow 가 표시.
 * ============================================================ */

import { PLAN, SPOT_PREF, REGIONS, PAINS } from "@/lib/join/constants";
import type { Plan, SpotPref, Region, Pain } from "@/lib/join/constants";
import type { JoinAnswers, QuizStepIndex } from "./join.flow.types";

const PLAN_COPY: Record<Plan, { title: string; sub: string }> = {
  계획: { title: "계획 빡세게 짜는 편", sub: "동선·맛집 다 정해둠" },
  즉흥: { title: "그냥 가서 즉흥으로", sub: "발길 닿는 대로" },
};

const SPOT_COPY: Record<SpotPref, { title: string; sub: string }> = {
  핫플: { title: "다들 가는 핫플", sub: "유명한 덴 이유가 있지" },
  로컬: { title: "아무도 모르는 로컬", sub: "숨은 곳 발굴이 재밌어" },
};

export default function QuizStep({
  step,
  answers,
  onPick,
  onChange,
  onBack,
  onNext,
}: {
  step: QuizStepIndex;
  answers: JoinAnswers;
  /** Step1/2 자동 진행용 단일 선택 */
  onPick: (patch: Partial<JoinAnswers>) => void;
  /** 텍스트/칩 단일선택 갱신(자동 진행 안 함) */
  onChange: (patch: Partial<JoinAnswers>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <button type="button" className="join-back" onClick={onBack}>
        ← 뒤로
      </button>

      {step === 1 && (
        <div className="join-stack">
          <h2 className="join-h2">여행 갈 때 나는…</h2>
          <div className="join-stack-sm">
            {PLAN.map((p) => (
              <OptionCard
                key={p}
                title={PLAN_COPY[p].title}
                sub={PLAN_COPY[p].sub}
                selected={answers.plan === p}
                onClick={() => onPick({ plan: p })}
              />
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="join-stack">
          <h2 className="join-h2">더 끌리는 여행지는…</h2>
          <div className="join-stack-sm">
            {SPOT_PREF.map((s) => (
              <OptionCard
                key={s}
                title={SPOT_COPY[s].title}
                sub={SPOT_COPY[s].sub}
                selected={answers.spotPref === s}
                onClick={() => onPick({ spotPref: s })}
              />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="join-stack">
          <h2 className="join-h2">
            외국인 친구가 한국 오면, 어디로 데려갈래요?
          </h2>
          <div className="join-chips" role="group" aria-label="추천 지역">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                className="join-chip"
                aria-pressed={answers.recRegion === r}
                onClick={() =>
                  onChange({
                    recRegion: answers.recRegion === r ? null : (r as Region),
                  })
                }
              >
                {r}
              </button>
            ))}
          </div>
          <div>
            <label className="join-label" htmlFor="join-recspot">
              그곳의 ‘진짜’ 스팟 (선택)
            </label>
            <input
              id="join-recspot"
              className="join-input"
              type="text"
              value={answers.recSpot}
              onChange={(e) => onChange({ recSpot: e.target.value })}
              placeholder="그곳의 ‘진짜’ 스팟 하나 (예: 대구 김광석거리 야경)"
              maxLength={120}
            />
          </div>
          <button
            type="button"
            className="join-cta"
            onClick={onNext}
            disabled={!answers.recRegion}
          >
            다음 →
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="join-stack">
          <h2 className="join-h2">여행 다닐 때 제일 답답했던 건?</h2>
          <div className="join-chips" role="group" aria-label="여행 중 불편">
            {PAINS.map((p) => (
              <button
                key={p}
                type="button"
                className="join-chip"
                aria-pressed={answers.pain === p}
                onClick={() =>
                  onChange({
                    pain: answers.pain === p ? null : (p as Pain),
                  })
                }
              >
                {p}
              </button>
            ))}
          </div>
          <div>
            <label className="join-label" htmlFor="join-paintext">
              한 줄 (선택)
            </label>
            <input
              id="join-paintext"
              className="join-input"
              type="text"
              value={answers.painText}
              onChange={(e) => onChange({ painText: e.target.value })}
              placeholder="한 줄로 적어줘도 좋아요 (선택)"
              maxLength={120}
            />
          </div>
          <button type="button" className="join-cta" onClick={onNext}>
            내 탑승권 받기 →
          </button>
        </div>
      )}
    </div>
  );
}

function OptionCard({
  title,
  sub,
  selected,
  onClick,
}: {
  title: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="join-optcard"
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="join-optcard-title">{title}</span>
      <span className="join-optcard-sub">{sub}</span>
    </button>
  );
}
