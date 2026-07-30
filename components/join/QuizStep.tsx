"use client";

/* ============================================================
 * (2) quiz — MBTI 선택 → (모르면 추정 4문항) → 여행 성향 4문항 → 수집 2스텝
 *   스텝 구성은 lib/join/quiz.ts 의 buildQuizSteps() 가 만들고
 *   여기선 현재 스텝 하나를 그리기만 한다(문항 추가·수정 시 이 파일 무변경).
 *   각 스텝 좌상단 뒤로가기(첫 스텝→hero). RouteBar 는 JoinFlow 가 표시.
 * ============================================================ */

import { MBTI_CODES, REGIONS, PAINS, getTravelerType } from "@/lib/join/constants";
import type { MbtiCode, Region, Pain } from "@/lib/join/constants";
import { MBTI_QUESTIONS, TRAVEL_QUESTIONS } from "@/lib/join/quiz";
import type { QuizStep } from "@/lib/join/quiz";
import type { JoinAnswers } from "./join.flow.types";

export default function QuizStep({
  step,
  stepNumber,
  totalSteps,
  answers,
  onPickMbti,
  onPickMbtiAnswer,
  onPickTravel,
  onChange,
  onBack,
  onNext,
}: {
  /** 지금 그릴 스텝 */
  step: QuizStep;
  /** 진행률 표시용(1-based) */
  stepNumber: number;
  totalSteps: number;
  answers: JoinAnswers;
  /** MBTI 직접 선택(null = "잘 모르겠어요") */
  onPickMbti: (code: MbtiCode | null) => void;
  /** MBTI 추정 문항 답 */
  onPickMbtiAnswer: (questionIndex: number, value: string) => void;
  /** 여행 성향 문항 답 */
  onPickTravel: (questionIndex: number, value: string) => void;
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

      <QuizProgress step={stepNumber} total={totalSteps} />

      {step.kind === "mbti-pick" && (
        <MbtiPicker
          selected={answers.mbti}
          unknown={answers.mbtiUnknown}
          onPick={onPickMbti}
        />
      )}

      {step.kind === "mbti-q" && (
        <QuestionScreen
          id={`mbti-${step.index}`}
          note="정식 검사는 아니고, 유형을 가늠해보는 4문항이에요."
          question={MBTI_QUESTIONS[step.index]}
          picked={answers.mbtiPicks[step.index]}
          onPick={(v) => onPickMbtiAnswer(step.index, v)}
        />
      )}

      {step.kind === "travel-q" && (
        <QuestionScreen
          id={`travel-${step.index}`}
          question={TRAVEL_QUESTIONS[step.index]}
          picked={answers.travelPicks[step.index]}
          onPick={(v) => onPickTravel(step.index, v)}
        />
      )}

      {step.kind === "rec" && (
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

      {step.kind === "pain" && (
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

/** MBTI 16개 그리드 + "잘 모르겠어요". 아는 사람은 여기서 한 번에 끝난다. */
function MbtiPicker({
  selected,
  unknown,
  onPick,
}: {
  selected: MbtiCode | null;
  unknown: boolean;
  onPick: (code: MbtiCode | null) => void;
}) {
  const picked = getTravelerType(selected);

  return (
    <div className="join-stack">
      <h2 className="join-h2" id="join-q-mbti">
        내 MBTI는?
      </h2>
      <div className="mbtigrid" role="group" aria-labelledby="join-q-mbti">
        {MBTI_CODES.map((code) => (
          <button
            key={code}
            type="button"
            className="mbtigrid-cell"
            aria-pressed={selected === code}
            onClick={() => onPick(code)}
          >
            <span className="mbtigrid-code">{code}</span>
            <span className="mbtigrid-emoji" aria-hidden="true">
              {getTravelerType(code)?.emoji}
            </span>
          </button>
        ))}
      </div>

      {/* 고른 유형의 별명을 즉시 보여준다 — 오탭 확인 + 결과 미리보기(기대감). */}
      {picked && (
        <p className="join-micro" style={{ textAlign: "center" }}>
          {picked.emoji} <strong>{picked.name}</strong>
        </p>
      )}

      <button
        type="button"
        className="join-btn-ghost"
        aria-pressed={unknown}
        onClick={() => onPick(null)}
      >
        잘 모르겠어요 → 4문항으로 찾기
      </button>
    </div>
  );
}

/** 2지선다 문항 한 화면(MBTI 추정·여행 성향 공용). */
function QuestionScreen({
  id,
  question,
  picked,
  onPick,
  note,
}: {
  id: string;
  question: { prompt: string; choices: readonly { value: string; title: string; sub: string }[] };
  picked: string | undefined;
  onPick: (value: string) => void;
  note?: string;
}) {
  return (
    <div className="join-stack">
      <h2 className="join-h2" id={`join-q-${id}`}>
        {question.prompt}
      </h2>
      {note && <p className="join-micro">{note}</p>}
      <div className="join-stack-sm" role="group" aria-labelledby={`join-q-${id}`}>
        {question.choices.map((c) => (
          <OptionCard
            key={c.value}
            title={c.title}
            sub={c.sub}
            selected={picked === c.value}
            onClick={() => onPick(c.value)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 진행률 — 스텝이 여러 개라 "언제 끝나지?" 가 이탈 사유가 된다.
 * 남은 개수를 눈에 보이게 해서 끝이 가깝다는 걸 계속 알려준다.
 */
function QuizProgress({ step, total }: { step: number; total: number }) {
  const clamped = Math.min(Math.max(step, 1), total);
  const percent = Math.round((clamped / total) * 100);

  return (
    <div className="quizprog">
      <div className="quizprog-track">
        <div className="quizprog-fill" style={{ width: `${percent}%` }} />
      </div>
      {/* 시각용과 낭독용을 섞지 않고 나눈다 — 숫자 사이에 sr-only 를 끼워 넣으면
          낭독 순서가 읽는 도구마다 달라진다. */}
      <span className="quizprog-label" aria-hidden="true">
        {clamped} / {total}
      </span>
      <span className="join-sr-only">
        {total}개 중 {clamped}번째
      </span>
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
