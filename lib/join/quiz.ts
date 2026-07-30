/* ============================================================
 * 동행단 초대 — 문항 정의 + 채점
 *   두 종류의 문항이 있다.
 *
 *   1) MBTI 간이 추정 4문항 — 자기 MBTI 를 모르는 사람만 본다.
 *      ⚠️ 정식 검사가 아니라 추정이다. UI 에도 그렇게 표시할 것.
 *      아는 사람은 16개 중에서 직접 고르므로 이 문항을 아예 건너뛴다
 *      (본인이 아는 유형과 다르게 나오면 신뢰를 잃기 때문).
 *
 *   2) 여행 성향 4문항 — 축당 1문항. 이쪽이 우리가 실제로 쓰는 제품 신호다
 *      (plan/spot_pref 는 DB 컬럼이 따로 있다).
 *
 *   문항은 여기 데이터로만 정의하고 QuizStep 은 그리기만 한다.
 * ============================================================ */

import { MBTI_DICHOTOMIES } from './constants';
import type {
  MbtiAxisKey,
  MbtiCode,
  Plan,
  SpotPref,
  Pace,
  Focus,
} from './constants';

export interface Choice {
  /** 이 선택지가 가리키는 값(MBTI 글자 또는 여행 축 값) */
  value: string;
  title: string;
  sub: string;
}

export interface Question {
  prompt: string;
  choices: readonly [Choice, Choice];
}

/** MBTI 간이 추정 문항 — 지표 순서대로 4개(E/I, S/N, T/F, J/P). */
export interface MbtiQuestion extends Question {
  axis: MbtiAxisKey;
}

export const MBTI_QUESTIONS: readonly MbtiQuestion[] = [
  {
    axis: 'EI',
    prompt: '여행지에서 처음 만난 사람들과 있을 때 나는…',
    choices: [
      { value: 'E', title: '먼저 말을 거는 편', sub: '금방 친해져요' },
      { value: 'I', title: '조용히 있는 편', sub: '먼저 다가오면 반가워요' },
    ],
  },
  {
    axis: 'SN',
    prompt: '여행지를 고를 때 더 끌리는 건…',
    choices: [
      { value: 'S', title: '실제 후기와 사진', sub: '가보고 온 사람 말이 정확하죠' },
      { value: 'N', title: '그곳의 분위기와 이야기', sub: '어떤 느낌일지 상상해봐요' },
    ],
  },
  {
    axis: 'TF',
    prompt: '일행과 가고 싶은 곳이 갈렸다. 나는…',
    choices: [
      { value: 'T', title: '더 합리적인 쪽으로 정리', sub: '동선이랑 시간을 따져봐요' },
      { value: 'F', title: '다들 기분 좋은 쪽으로', sub: '누가 서운하면 안 되니까요' },
    ],
  },
  {
    axis: 'JP',
    prompt: '여행 일정은…',
    choices: [
      { value: 'J', title: '미리 정해둬야 마음이 편함', sub: '정해져 있어야 안심돼요' },
      { value: 'P', title: '그때그때 정하는 게 좋음', sub: '묶여 있는 게 답답해요' },
    ],
  },
] as const;

/** 여행 성향 문항 — 축당 1문항, JoinAnswers 의 어느 필드를 채우는지 명시. */
export type TravelAxisField = 'plan' | 'spotPref' | 'pace' | 'focus';

export interface TravelQuestion extends Question {
  field: TravelAxisField;
}

export const TRAVEL_QUESTIONS: readonly TravelQuestion[] = [
  {
    field: 'plan',
    prompt: '여행 가기 전날 밤, 나는…',
    choices: [
      {
        value: '계획',
        title: '시간대별 동선을 정리해둔다',
        sub: '몇 시에 어디, 뭘 먹을지까지',
      },
      { value: '즉흥', title: '일단 짐만 싸고 잔다', sub: '가서 정하면 되죠' },
    ],
  },
  {
    field: 'spotPref',
    prompt: '여행지 도착. 제일 먼저 향하는 곳은?',
    choices: [
      {
        value: '핫플',
        title: '다들 인증샷 찍는 그 명소',
        sub: '유명한 데는 이유가 있어요',
      },
      { value: '로컬', title: '현지인만 아는 골목', sub: '숨은 곳 발굴이 재밌어요' },
    ],
  },
  {
    field: 'pace',
    prompt: '하루 일정을 짠다면?',
    choices: [
      { value: '빽빽', title: '아침부터 밤까지 꽉 채운다', sub: '온 김에 최대한 많이' },
      {
        value: '여유',
        title: '두세 곳만 천천히',
        sub: '쫓기듯 다니면 남는 게 없어요',
      },
    ],
  },
  {
    field: 'focus',
    prompt: '이번 여행, 절대 포기 못 하는 건?',
    choices: [
      {
        value: '미식',
        title: '거기서만 먹을 수 있는 한 끼',
        sub: '먹으러 가는 거죠',
      },
      { value: '풍경', title: '숨 멎는 풍경 한 장면', sub: '그 장면 하나면 돼요' },
    ],
  },
] as const;

export const MBTI_QUESTION_COUNT = MBTI_QUESTIONS.length;
export const TRAVEL_QUESTION_COUNT = TRAVEL_QUESTIONS.length;

/* ------------------------------------------------------------
 * 스텝 구성 — MBTI 를 직접 골랐는지에 따라 스텝 수가 달라진다.
 *   인덱스 산술 대신 스텝 목록을 만들어 쓴다(경계 계산 실수 방지).
 * ------------------------------------------------------------ */
export type QuizStep =
  | { kind: 'mbti-pick' }
  | { kind: 'mbti-q'; index: number }
  | { kind: 'travel-q'; index: number }
  | { kind: 'rec' }
  | { kind: 'pain' };

/**
 * @param needsMbtiQuiz "MBTI 잘 모르겠어요" 를 고른 경우에만 true.
 */
export function buildQuizSteps(needsMbtiQuiz: boolean): QuizStep[] {
  const steps: QuizStep[] = [{ kind: 'mbti-pick' }];
  if (needsMbtiQuiz) {
    for (let i = 0; i < MBTI_QUESTION_COUNT; i++) {
      steps.push({ kind: 'mbti-q', index: i });
    }
  }
  for (let i = 0; i < TRAVEL_QUESTION_COUNT; i++) {
    steps.push({ kind: 'travel-q', index: i });
  }
  steps.push({ kind: 'rec' });
  steps.push({ kind: 'pain' });
  return steps;
}

/* ------------------------------------------------------------
 * 채점
 * ------------------------------------------------------------ */

/** 문항 index → 선택값. MBTI 문항과 여행 문항은 서로 다른 맵을 쓴다. */
export type Picks = Record<number, string>;

/**
 * MBTI 간이 문항 4개 → MBTI 코드.
 * 4개를 다 answered 해야 코드가 나온다(하나라도 비면 null).
 * 지표당 1문항이라 무승부가 없다.
 */
export function scoreMbti(picks: Picks): MbtiCode | null {
  let code = '';
  for (let i = 0; i < MBTI_QUESTIONS.length; i++) {
    const q = MBTI_QUESTIONS[i];
    const picked = picks[i];
    const dich = MBTI_DICHOTOMIES.find((d) => d.key === q.axis);
    if (!dich) return null;
    if (picked !== dich.left && picked !== dich.right) return null;
    code += picked;
  }
  // MBTI_DICHOTOMIES 순서(EI→SN→TF→JP)가 곧 코드 자리 순서다.
  return code as MbtiCode;
}

/** 여행 성향 결과. 답 안 한 축은 null. */
export interface TravelScore {
  plan: Plan | null;
  spotPref: SpotPref | null;
  pace: Pace | null;
  focus: Focus | null;
}

/** 여행 문항 선택 → 4축 결과(축당 1문항이라 그대로 대입). */
export function scoreTravel(picks: Picks): TravelScore {
  /** field 별로 유효한 선택값만 추려낸다. */
  const pickFor = (field: TravelAxisField): string | null => {
    const i = TRAVEL_QUESTIONS.findIndex((q) => q.field === field);
    if (i < 0) return null;
    const picked = picks[i];
    if (!picked) return null;
    return TRAVEL_QUESTIONS[i].choices.some((c) => c.value === picked)
      ? picked
      : null;
  };

  return {
    plan: pickFor('plan') as Plan | null,
    spotPref: pickFor('spotPref') as SpotPref | null,
    pace: pickFor('pace') as Pace | null,
    focus: pickFor('focus') as Focus | null,
  };
}
