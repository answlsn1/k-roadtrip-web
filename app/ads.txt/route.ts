import { ADSENSE_CLIENT, adsEnabled } from "@/lib/config/ads";

/* ============================================================
 * /ads.txt — AdSense 판매자 인증 파일 (IAB ads.txt 스펙)
 *   게이트: NEXT_PUBLIC_ADSENSE_CLIENT 미설정 → 404. 실값이 들어오기
 *   전까지 프로덕션 무영향(런칭 헌장 §5 — 실값 없이는 수익 영역 무영향).
 *   NEXT_PUBLIC_* env는 빌드 시점 값이므로 기본(정적) 평가로 충분하다.
 *   robots.ts는 루트 파일을 막지 않으므로 크롤러 접근에 문제 없음.
 * ============================================================ */

export function GET(): Response {
  if (!adsEnabled) {
    return new Response(null, { status: 404 });
  }
  // ads.txt 형식은 "pub-…" — 클라이언트 ID의 "ca-" 접두어를 벗긴다.
  const pubId = ADSENSE_CLIENT.replace(/^ca-/, "");
  return new Response(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain" },
  });
}
