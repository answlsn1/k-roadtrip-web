/* ============================================================
 * 동행단 초대(Join Companion) — 검증·UI 공용 상수
 *   Server Action(서버 검증)과 향후 Phase 2 UI 가 함께 import 한다.
 *   값은 한국어 전용(이 플로우는 한국 대학생·20대 대상 한국어 웹).
 *   ⚠️ 여기 리터럴은 마이그레이션의 CHECK 제약과 1:1 로 맞춰야 한다.
 * ============================================================ */

// ── 연락처 종류 ─────────────────────────────────────────────
export const CONTACT_TYPES = ['카톡', '인스타', '이메일', '전화'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

// ── 여행 성향(quiz) ─────────────────────────────────────────
export const PLAN = ['계획', '즉흥'] as const;
export type Plan = (typeof PLAN)[number];

export const SPOT_PREF = ['핫플', '로컬'] as const;
export type SpotPref = (typeof SPOT_PREF)[number];

// ── 추천 지역 목록 ─────────────────────────────────────────
export const REGIONS = [
  '서울',
  '부산',
  '대구',
  '경주',
  '강릉',
  '제주',
  '전주',
  '여수',
  '속초',
  '기타',
] as const;
export type Region = (typeof REGIONS)[number];

// ── 여행 중 불편(pain) 목록 ─────────────────────────────────
export const PAINS = [
  '가는 길·교통편',
  '진짜 맛집·로컬 정보',
  '언어 장벽',
  '정보가 사방에 흩어짐',
  '예약·결제',
  '동선 짜기',
] as const;
export type Pain = (typeof PAINS)[number];

// ── 여행자 유형 (plan × spot_pref 4종) ──────────────────────
// §ticket 단계에서 quiz 결과(plan/spot_pref)로 산출해 보여준다.
export interface TravelerType {
  emoji: string;
  name: string;
  desc: string;
}

/** 키 형식: `${Plan}+${SpotPref}` (예: '계획+핫플'). */
export type TravelerTypeKey = `${Plan}+${SpotPref}`;

export const TRAVELER_TYPES: Record<TravelerTypeKey, TravelerType> = {
  '계획+핫플': {
    emoji: '🗺️',
    name: '알찬 핫플 큐레이터',
    desc: '정보력으로 완벽한 코스를 짜는 타입',
  },
  '계획+로컬': {
    emoji: '📓',
    name: '꼼꼼한 로컬 탐험가',
    desc: '미리 조사해 숨은 동네까지 챙기는 타입',
  },
  '즉흥+핫플': {
    emoji: '✨',
    name: '발길 닿는 핫플 헌터',
    desc: '끌리는 곳으로 즉흥에 떠나는 트렌드세터',
  },
  '즉흥+로컬': {
    emoji: '🧭',
    name: '자유로운 로컬 방랑자',
    desc: '계획 없이 골목을 누비는 진짜 여행가',
  },
};

/** quiz 결과로 여행자 유형을 안전 조회(둘 중 하나라도 없으면 null). */
export function resolveTravelerType(
  plan: Plan | null | undefined,
  spotPref: SpotPref | null | undefined,
): TravelerType | null {
  if (!plan || !spotPref) return null;
  return TRAVELER_TYPES[`${plan}+${spotPref}`] ?? null;
}

// ── 동행단 초대 퍼널 이벤트 타입(6종) ──────────────────────
// `events` 테이블 재사용(CHECK 확장). 클라 계측은 Phase 4, 서버는 join_submit 만.
export const JOIN_EVENT_TYPES = [
  'join_view',
  'join_quiz_start',
  'join_quiz_complete',
  'join_ticket_view',
  'join_why_view',
  'join_submit',
] as const;
export type JoinEventType = (typeof JOIN_EVENT_TYPES)[number];
