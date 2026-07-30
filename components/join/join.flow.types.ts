/* ============================================================
 * 동행단 초대(Join Companion) — Phase 2 플로우 로컬 상태 타입
 *   클라이언트 상태머신(JoinFlow)에서만 쓰는 UI 전용 타입.
 *   제출 페이로드는 @/app/actions/submit-join 의 SubmitJoinInput 을 따른다.
 * ============================================================ */

import type {
  ContactType,
  MbtiCode,
  Plan,
  SpotPref,
  Pace,
  Focus,
  Region,
  Pain,
} from "@/lib/join/constants";

/** 상태머신 단계. quiz 는 내부 여러 스텝으로 분기된다. */
export type Stage = "hero" | "quiz" | "ticket" | "why" | "join" | "done";

/**
 * quiz 내부 스텝 인덱스(0-based).
 * 스텝 구성은 lib/join/quiz.ts 의 buildQuizSteps() 가 만든다 —
 * "MBTI 잘 모르겠어요" 를 고르면 추정 문항 4개가 중간에 끼어들어
 * 전체 스텝 수가 달라지므로 여기선 number 로만 둔다.
 */
export type QuizStepIndex = number;

/** 문항 index → 선택값. */
export type Picks = Record<number, string>;

/** 플로우가 모으는 모든 응답(전부 선택값이라 부분 채움 가능). */
export interface JoinAnswers {
  // ── MBTI ──
  /** 최종 유형. 직접 고른 값이거나 추정 문항 결과. */
  mbti: MbtiCode | null;
  /** "잘 모르겠어요" 를 골라 추정 문항을 거치는 중인가 */
  mbtiUnknown: boolean;
  /** MBTI 추정 문항 선택 기록(뒤로 가기 복원용) */
  mbtiPicks: Picks;

  // ── 여행 성향 4축 ──
  plan: Plan | null;
  spotPref: SpotPref | null;
  pace: Pace | null;
  focus: Focus | null;
  /** 여행 문항 선택 기록(뒤로 가기 복원용) */
  travelPicks: Picks;

  // ── 수집용 ──
  recRegion: Region | null;
  recSpot: string;
  pain: Pain | null;
  painText: string;

  // ── 연락처/옵트인 ──
  name: string;
  contactType: ContactType;
  contact: string;
  word: string;
  wantInterview: boolean;
  wantPrototype: boolean;
}
