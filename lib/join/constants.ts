/* ============================================================
 * 동행단 초대(Join Companion) — 검증·UI 공용 상수
 *   Server Action(서버 검증)과 Phase 2 UI 가 함께 import 한다.
 *   값은 한국어 전용(이 플로우는 한국 대학생·20대 대상 한국어 웹).
 *   ⚠️ PLAN / SPOT_PREF / CONTACT_TYPES 리터럴은 마이그레이션의 CHECK 제약과
 *      1:1 로 맞춰야 한다(DB 컬럼이 존재하는 축). 값을 바꾸면 insert 가 거부된다.
 * ============================================================ */

// ── 연락처 종류 ─────────────────────────────────────────────
export const CONTACT_TYPES = ['카톡', '인스타', '이메일', '전화'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

/* ------------------------------------------------------------
 * MBTI — 유형 체계는 우리가 새로 만들지 않고 실제 MBTI 를 그대로 쓴다.
 *   한국 사용자는 이미 자기 유형을 알고 있어서 인지·공유 효과가 크고,
 *   우리가 할 일은 각 유형에 "여행 별명"을 붙이는 것뿐이다.
 *   ⚠️ 유형은 사용자가 직접 고른다(문항으로 판별해 본인이 아는 유형과
 *      다르게 나오면 신뢰를 잃는다). 모르는 사람만 4문항 간이 추정.
 * ------------------------------------------------------------ */

export const MBTI_CODES = [
  'ENFP', 'INFP', 'ENTP', 'INTP',
  'ENFJ', 'INFJ', 'ENTJ', 'INTJ',
  'ESFP', 'ISFP', 'ESTP', 'ISTP',
  'ESFJ', 'ISFJ', 'ESTJ', 'ISTJ',
] as const;
export type MbtiCode = (typeof MBTI_CODES)[number];

/** MBTI 4개 지표(폴백 문항 채점·표시용). */
export const MBTI_DICHOTOMIES = [
  { key: 'EI', left: 'E', right: 'I', label: '에너지 방향' },
  { key: 'SN', left: 'S', right: 'N', label: '인식 방식' },
  { key: 'TF', left: 'T', right: 'F', label: '판단 기준' },
  { key: 'JP', left: 'J', right: 'P', label: '생활 양식' },
] as const;
export type MbtiAxisKey = (typeof MBTI_DICHOTOMIES)[number]['key'];

/* ------------------------------------------------------------
 * 여행 성향 4축 — MBTI 와 별개로 우리가 실제로 쓰는 제품 신호.
 *   축1 plan     계획 / 즉흥  ← DB 컬럼 있음(CHECK 제약)
 *   축2 spotPref 핫플 / 로컬  ← DB 컬럼 있음(CHECK 제약)
 *   축3 pace     빽빽 / 여유  ← DB 컬럼 없음(travel_type 에 함께 기록)
 *   축4 focus    미식 / 풍경  ← DB 컬럼 없음(travel_type 에 함께 기록)
 * ------------------------------------------------------------ */

export const PLAN = ['계획', '즉흥'] as const;
export type Plan = (typeof PLAN)[number];

export const SPOT_PREF = ['핫플', '로컬'] as const;
export type SpotPref = (typeof SPOT_PREF)[number];

export const PACE = ['빽빽', '여유'] as const;
export type Pace = (typeof PACE)[number];

export const FOCUS = ['미식', '풍경'] as const;
export type Focus = (typeof FOCUS)[number];

/** 여행 성향 축 메타(티켓 하단 요약 표시용). */
export const TRAVEL_AXES = [
  { label: '여행 준비', values: PLAN },
  { label: '목적지 취향', values: SPOT_PREF },
  { label: '하루 밀도', values: PACE },
  { label: '여행의 동력', values: FOCUS },
] as const;

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

/* ------------------------------------------------------------
 * MBTI 16유형 × 여행 별명
 *   mate 규칙: J/P(계획·즉흥)만 반대이고 앞 세 글자는 같은 유형.
 *   가고 싶은 곳·에너지·판단 기준은 통하는데 한 명이 짜고 한 명이
 *   흘러가서 서로를 채워주는 조합이라 여행 메이트로 잘 맞는다.
 * ------------------------------------------------------------ */
export interface TravelerType {
  /** MBTI 코드(키와 동일) */
  code: MbtiCode;
  emoji: string;
  /** 우리가 붙인 여행 별명 */
  name: string;
  /** 여행 관점 한 줄 설명 */
  desc: string;
  /** 짧은 특징 키워드 3개 */
  traits: readonly string[];
  /** 잘 맞는 여행 메이트 MBTI */
  mate: MbtiCode;
}

export const TRAVELER_TYPES: Record<string, TravelerType> = {
  ENFP: {
    code: 'ENFP',
    emoji: '🎈',
    name: '즉흥 감성 유랑러',
    desc: '끌리는 대로 떠나서 현지 사람들과 금세 친해지는 타입',
    traits: ['계획은 대충', '대화는 술술', '사진 폭탄'],
    mate: 'ENFJ',
  },
  INFP: {
    code: 'INFP',
    emoji: '🌿',
    name: '혼자 걷는 감성 수집가',
    desc: '조용한 골목에서 오래 머물며 그날의 기분을 담아오는 타입',
    traits: ['혼자가 편함', '오래 머물기', '기록 남기기'],
    mate: 'INFJ',
  },
  ENTP: {
    code: 'ENTP',
    emoji: '🧭',
    name: '안 가본 길 개척자',
    desc: '남들 다 가는 코스는 시시해서 새 루트를 뚫는 타입',
    traits: ['남과 다르게', '즉흥 변경', '호기심 폭발'],
    mate: 'ENTJ',
  },
  INTP: {
    code: 'INTP',
    emoji: '🗺️',
    name: '지도 파고드는 분석가',
    desc: '출발 전에 지도부터 뜯어보고 최적 동선을 찾아내는 타입',
    traits: ['동선 최적화', '혼자 탐구', '검색 만렙'],
    mate: 'INTJ',
  },
  ENFJ: {
    code: 'ENFJ',
    emoji: '🤝',
    name: '다 챙기는 여행 인솔자',
    desc: '일행 취향까지 맞춰서 일정을 짜는 타입',
    traits: ['일행 우선', '예약 담당', '분위기 메이커'],
    mate: 'ENFP',
  },
  INFJ: {
    code: 'INFJ',
    emoji: '🕯️',
    name: '의미를 찾는 순례자',
    desc: '사연이 있는 장소를 골라 조용히 걷는 타입',
    traits: ['의미 있는 곳', '깊이 파기', '조용한 감동'],
    mate: 'INFP',
  },
  ENTJ: {
    code: 'ENTJ',
    emoji: '📋',
    name: '일정 총괄 지휘자',
    desc: '목표를 정해두고 일행 전체를 끌고 가는 타입',
    traits: ['분 단위 일정', '결정 빠름', '완주 집착'],
    mate: 'ENTP',
  },
  INTJ: {
    code: 'INTJ',
    emoji: '♟️',
    name: '혼자 완벽한 전략가',
    desc: '미리 다 조사해두고 혼자 조용히 실행하는 타입',
    traits: ['사전 조사 끝', '혼자 실행', '변수 대비'],
    mate: 'INTP',
  },
  ESFP: {
    code: 'ESFP',
    emoji: '🎉',
    name: '지금 이 순간 흥부자',
    desc: '눈앞의 재미에 일단 올인하는 타입',
    traits: ['축제·핫플', '즉흥 합류', '텐션 최고'],
    mate: 'ESFJ',
  },
  ISFP: {
    code: 'ISFP',
    emoji: '🎨',
    name: '발길 닿는 미학자',
    desc: '예쁜 게 보이면 일정을 접고 멈춰 서는 타입',
    traits: ['예쁜 것 우선', '조용한 감상', '유연한 계획'],
    mate: 'ISFJ',
  },
  ESTP: {
    code: 'ESTP',
    emoji: '🏄',
    name: '액티비티 사냥꾼',
    desc: '몸으로 부딪히는 체험부터 찾아 나서는 타입',
    traits: ['체험 우선', '스릴 추구', '결정 즉시'],
    mate: 'ESTJ',
  },
  ISTP: {
    code: 'ISTP',
    emoji: '🔧',
    name: '장비 챙긴 솔로 드라이버',
    desc: '혼자 차 몰고 떠나 뭐든 알아서 해결하는 타입',
    traits: ['혼자 운전', '장비파', '문제 해결'],
    mate: 'ISTJ',
  },
  ESFJ: {
    code: 'ESFJ',
    emoji: '🍱',
    name: '다 같이 즐거운 총무',
    desc: '맛집 예약부터 회비까지 챙기는 타입',
    traits: ['예약 담당', '다 같이', '챙김 만렙'],
    mate: 'ESFP',
  },
  ISFJ: {
    code: 'ISFJ',
    emoji: '🧳',
    name: '빈틈없이 챙기는 준비왕',
    desc: '상비약까지 챙겨 와서 일행을 구해주는 타입',
    traits: ['준비물 완비', '조용한 배려', '안전 우선'],
    mate: 'ISFP',
  },
  ESTJ: {
    code: 'ESTJ',
    emoji: '⏱️',
    name: '시간표대로 완주자',
    desc: '한 번 정한 일정은 기어이 지켜내는 타입',
    traits: ['정시 출발', '계획 사수', '효율 중시'],
    mate: 'ESTP',
  },
  ISTJ: {
    code: 'ISTJ',
    emoji: '✅',
    name: '검증된 것만 믿는 실속파',
    desc: '후기를 확인하고 확실한 곳만 골라 가는 타입',
    traits: ['후기 정독', '실패 없는 선택', '예산 관리'],
    mate: 'ISTP',
  },
};

/** 키 형식: MBTI 코드(예: 'ENFP'). */
export type TravelerTypeKey = string;

/**
 * 코드로 유형을 안전 조회.
 * 알 수 없는 코드(구버전 localStorage 에 남은 '계획+핫플' / 'PHDM' 등)는 null.
 * 호출부가 `TRAVELER_TYPES[key]` 를 직접 쓰면 undefined 가 새어나가므로
 * 반드시 이 함수를 경유할 것.
 */
export function getTravelerType(
  code: string | null | undefined,
): TravelerType | null {
  if (!code) return null;
  return TRAVELER_TYPES[code] ?? null;
}

/** 문자열이 유효한 MBTI 코드인지. */
export function isMbtiCode(v: unknown): v is MbtiCode {
  return typeof v === 'string' && (MBTI_CODES as readonly string[]).includes(v);
}

/**
 * DB `travel_type`(자유 텍스트) 에 저장할 값.
 * 형식: `ENFP · 즉흥 감성 유랑러 (여유·미식)`
 *   - 앞 4글자 = MBTI 코드(파싱 가능)
 *   - 가운데 = 사람이 읽는 별명(어드민 목록·CSV 에 그대로 보임)
 *   - 괄호 = pace/focus. 전용 컬럼이 없어 여기가 유일한 보존 경로다
 *     (plan/spot_pref 는 각자 컬럼에 따로 들어간다).
 */
export function formatTravelTypeForStorage(
  type: TravelerType | null,
  pace: Pace | null | undefined,
  focus: Focus | null | undefined,
): string | null {
  if (!type) return null;
  const extra = [pace, focus].filter(Boolean).join('·');
  return extra
    ? `${type.code} · ${type.name} (${extra})`
    : `${type.code} · ${type.name}`;
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
