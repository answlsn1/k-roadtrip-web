/** "3일 전" 류 상대 시각 — 별도 라이브러리 없이 최소 구현. */
export function relativeTimeKo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffDay < 30) return `${diffWeek}주 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffDay < 365) return `${diffMonth}개월 전`;
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}년 전`;
}
