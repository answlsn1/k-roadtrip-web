/* ============================================================
 * 동행단 초대(Join Companion) — Phase 2 플로우 로컬 상태 타입
 *   클라이언트 상태머신(JoinFlow)에서만 쓰는 UI 전용 타입.
 *   제출 페이로드는 @/app/actions/submit-join 의 SubmitJoinInput 을 따른다.
 * ============================================================ */

import type {
  ContactType,
  Plan,
  SpotPref,
  Region,
  Pain,
} from "@/lib/join/constants";

/** 상태머신 단계. quiz 는 내부 4스텝(step1~4)으로 분기된다. */
export type Stage = "hero" | "quiz" | "ticket" | "why" | "join" | "done";

/** quiz 내부 4스텝 인덱스. */
export type QuizStepIndex = 1 | 2 | 3 | 4;

/** 플로우가 모으는 모든 응답(전부 선택값이라 부분 채움 가능). */
export interface JoinAnswers {
  // quiz
  plan: Plan | null;
  spotPref: SpotPref | null;
  recRegion: Region | null;
  recSpot: string;
  pain: Pain | null;
  painText: string;

  // 연락처/옵트인
  name: string;
  contactType: ContactType;
  contact: string;
  word: string;
  wantInterview: boolean;
  wantPrototype: boolean;
}
