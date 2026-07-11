/* ============================================================
 * 동행단 카페 인터뷰 — 세션 데이터 모델 + 공용 상수.
 *   /join 길거리 플로우에서 모집된 20대와 카페에서 "화면을 같이 보며"
 *   진행하는 인터뷰의 단일 소스. 지역·불편·여행자 유형은
 *   lib/join/constants 를 그대로 재사용(중복 정의 금지 — 단일 소스).
 *   저장은 localStorage 전용(krt-interview-sessions) — 서버 기록 없음.
 * ============================================================ */

import type { Region, TravelerTypeKey } from "@/lib/join/constants";

// ── 단계(역) ────────────────────────────────────────────────
// setup(인터뷰어 준비) → welcome~together(같이 보는 5개 역) → summary.
export type InterviewStage =
  | "setup"
  | "welcome"
  | "warmup"
  | "spots"
  | "style"
  | "together"
  | "summary";

/** 저장소 복원 시 stage 값 검증용(임의 문자열 유입 방어). */
export const INTERVIEW_STAGE_IDS: readonly InterviewStage[] = [
  "setup",
  "welcome",
  "warmup",
  "spots",
  "style",
  "together",
  "summary",
];

/** RouteBar 역 라벨 — 같이 보는 5개 단계와 1:1. */
export const STATIONS = [
  "만남",
  "여행 수다",
  "스팟 수집",
  "여행 방식",
  "같이 만들기",
] as const;

/** RouteBar 에 표시되는 단계 → 역 인덱스(setup/summary 는 미표시). */
export const STATION_INDEX: Partial<Record<InterviewStage, number>> = {
  welcome: 0,
  warmup: 1,
  spots: 2,
  style: 3,
  together: 4,
};

// ── 빠른 캡처 선택지 ────────────────────────────────────────
export const COMPANIONS = ["혼자", "친구", "가족", "연인", "동아리"] as const;

export const SOURCES = [
  "인스타그램",
  "블로그",
  "유튜브",
  "지도 앱",
  "친구·지인",
  "기타",
] as const;

/** 여행자 유형 공감 여부 — 가벼운 아이스브레이킹 답변 한 쌍. */
export const TYPE_MATCH = ["맞아요", "글쎄요"] as const;
export type TypeMatch = (typeof TYPE_MATCH)[number];

// ── 데이터 모델 ─────────────────────────────────────────────
export interface InterviewSpot {
  place: string;
  region: Region | null;
  why: string;
  recommendTo: string;
}

/** 스팟 수집기 빈 초안 — 세션 생성·추가 후 리셋에 공용. */
export const EMPTY_SPOT: InterviewSpot = {
  place: "",
  region: null,
  why: "",
  recommendTo: "",
};

export interface InterviewSessionData {
  id: string;
  /** 세션 시작(=화면 같이 보기 시작) 시각. null 이면 아직 준비 단계. */
  startedAt: string | null;
  /** 요약 화면 도달 시각. null 이면 진행 중(→ 이어서 하기 대상). */
  finishedAt: string | null;
  /** 현재 단계 — 저장해 두면 새로고침 후에도 같은 자리에서 이어간다. */
  stage: InterviewStage;
  name: string;
  travelerTypeKey: TravelerTypeKey | null;
  metLocation: string;
  /** "정리를 위해 메모해도 괜찮아요" 동의 토글 상태. */
  consent: boolean;
  // ── 여행 수다(warmup) ──
  companions: string[];
  recentTripMemo: string;
  typeMatch: TypeMatch | null;
  typeMemo: string;
  // ── 스팟 수집(spots) ──
  spots: InterviewSpot[];
  /** 수집기에 입력 중이던 초안 — 새로고침 복구용(구버전 저장 데이터엔 없음). */
  spotDraft?: InterviewSpot;
  // ── 여행 방식(style) ──
  sources: string[];
  pains: string[];
  styleMemo: string;
  // ── 같이 만들기(together) ──
  foreignFriendMemo: string;
  /** spots 배열 인덱스 — 오늘의 최애 픽. */
  topPickIndex: number | null;
}

// ── 인터뷰어 참고(진행 가이드) — 구 대본의 목적·원칙을 그대로 보존 ──
export const PURPOSE =
  "이 사람의 ‘기억에 남는 여행 스토리·스팟’을 듣고 데이터로 쌓기 — 어디를(스팟) · 왜 좋았는지(이유·감정) · 어떻게 여행을 만들었는지(과정·불편) · 외국인에게 추천한다면(제품 연결).";

export const PRINCIPLES = [
  "“정답 없어요, 그냥 여행 수다예요”를 계속 상기시키기.",
  "추상적(“최고의 여행은?”) 대신 구체적(“최근 다녀온 데는?”)으로 물어 기억을 쉽게 꺼내게.",
  "막히면 같이 폰 사진첩 열어보기 — 기억 트리거 끝판왕.",
  "답보다 “왜”를 더 캐기. 이유·감정이 우리 데이터의 핵심.",
  "리스트 다 채우려 서두르지 말고, 하나 나오면 꼬리질문으로 깊게.",
];

/**
 * 부분 갱신 — 객체 또는 함수형 업데이터.
 * 토글처럼 "이전 값에서 파생"하는 갱신은 반드시 함수형을 쓴다.
 * (같은 틱에 연속 탭하면 렌더 시점 값(stale closure)으로 계산돼
 *  앞선 선택이 유실될 수 있음 — 검증 중 실제로 재현된 버그.)
 */
export type PatchInput =
  | Partial<InterviewSessionData>
  | ((prev: InterviewSessionData) => Partial<InterviewSessionData>);

/** 단계 컴포넌트 공통 props — 데이터 + 부분 갱신 + 앞뒤 이동. */
export interface StageProps {
  data: InterviewSessionData;
  patch: (p: PatchInput) => void;
  onNext: () => void;
  onBack: () => void;
}
