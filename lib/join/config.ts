/* ============================================================
 * 동행단 초대(Join Companion) — 운영자 노출 텍스트 설정
 *   사장님이 쉽게 바꾸도록 한 객체로 묶었다(한국어 기본값).
 *   민감 정보 아님 — 이름/태그라인 등 공개 문구만. 일부는 env 로 override 가능.
 *   ⚠️ 신규 env 추가 금지 규칙에 따라 기존 NEXT_PUBLIC_SITE_URL 만 사용.
 * ============================================================ */

export interface JoinConfig {
  /** 앱 이름 */
  appName: string;
  /** 공개 URL (env override 가능) */
  appUrl: string;
  /** 우리가 풀려는 문제/미션 한 줄 */
  mission: string;
  /** 참여 보상 안내 */
  reward: string;
  /** 히어로 CTA 위 보상 티저 한 줄(이탈 방지) */
  heroTeaser: string;
  /** 추천 스팟을 '본인 별명'으로 실제 앱 루트에 등록해 준다는 메리트 한 줄 */
  aliasCredit: string;
  /** 연락을 어떻게/언제 줄지 안내 */
  contactBack: string;
  /** 창업자 이름 */
  founderName: string;
  /** 창업자 한 줄 소개 */
  founderTagline: string;
  /** 창업자 이니셜(아바타 폴백용) */
  founderInitial: string;
  /** 지자체/공익 연결 한 줄 */
  govLine: string;
}

export const joinConfig: JoinConfig = {
  appName: 'K-RoadTrip',
  appUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://k-roadtrip.app',
  mission:
    '서울 너머, 한국 지방을 제대로 여행하는 길을 만들고 있어요. 당신의 진짜 경험이 그 지도를 채웁니다.',
  reward: '커피 한 잔(제대로 된 이야기엔 식사까지)',
  heroTeaser: '☕ 커피는 제가 살게요 · 퀴즈로 내 여행유형도 받고',
  aliasCredit:
    '알려준 그 스팟이 ‘당신 별명’을 단 추천 코스로 실제 앱에 올라갈 수 있어요. ‘이거 내가 추천했어’ 하고 자랑할 수 있게.',
  contactBack:
    '남겨주신 연락처로 며칠 안에 가볍게 연락드릴게요. 부담 없이 편한 시간에 만나요.',
  founderName: '안지수',
  founderTagline: '여행을 좋아해서 직접 만들기 시작한 1인 개발자예요.',
  founderInitial: 'K',
  govLine: '지방 여행 활성화 — 지자체와도 함께 이야기하고 있어요.',
};

/* ============================================================
 * 온라인 추천(Recommend) — /recommend 페이지 전용 설정.
 *   joinConfig 와 거의 동일하지만, 카페 인터뷰가 기본 전제가 아니라
 *   "온라인에서 바로 끝나는" 흐름이라 그 부분 문구만 다르다.
 *   (카페 만남은 JoinForm 의 wantInterview 토글로 여전히 선택 가능.)
 * ============================================================ */
export const recommendConfig: JoinConfig = {
  ...joinConfig,
  heroTeaser: '🎫 30초 퀴즈로 내 여행 유형 받고 · 내 최애 스팟도 자랑하기',
  contactBack:
    '알려주신 스팟은 실제 코스 기획에 참고할게요. 궁금한 점 있으면 남겨주신 연락처로 편하게 연락드릴 수도 있어요.',
};
