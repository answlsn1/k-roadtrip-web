import { ImageResponse } from "next/og";
import { getPublicRouteMeta } from "@/lib/motorcycle/server";
import { windingGrade } from "@/lib/motorcycle/windingScore";

/* ============================================================
 * 동적 OG 이미지 — "코스 카드"(TRAFFIC-STRATEGY §2-D, §6.2-1).
 *   카톡 오픈채팅/밴드/카페에 루트 링크가 붙었을 때 뜨는 미리보기가
 *   곧 퍼가기 아티팩트다. 루트 궤적(트랙 또는 경유지 연결)을 SVG
 *   폴리라인으로 그려 넣는다. 비공개/없는 루트 → 브랜드 카드 폴백.
 * ============================================================ */

// edge 런타임: ① Windows dev 의 next/og 기본폰트 경로 버그(ERR_INVALID_URL) 회피
// ② 한글 폰트를 직접 로드해야 해서 어차피 기본폰트에 의존하지 않는다.
export const runtime = "edge";
export const alt = "K-Riders 라이딩 루트";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#16181d";
const AMBER = "#f59e0b";

// 한글 렌더용 폰트(Spoqa Han Sans, OFL) — satori 는 woff2 미지원이라 TTF 사용.
// 모듈 스코프 fetch 로 웜 인스턴스에서 재사용. 실패 시 폰트 없이 렌더(영문/숫자만 정상).
const FONT_URL =
  "https://cdn.jsdelivr.net/gh/spoqa/spoqa-han-sans@latest/Subset/SpoqaHanSans/SpoqaHanSansBold.ttf";
const fontPromise: Promise<ArrayBuffer | null> = fetch(FONT_URL)
  .then((r) => (r.ok ? r.arrayBuffer() : null))
  .catch(() => null);

/** [[lat,lng],...] → SVG 좌표 문자열(뷰박스에 맞게 정규화, 위아래 반전). */
function toPolylinePoints(
  pts: [number, number][],
  w: number,
  h: number,
  pad: number
): string {
  const lats = pts.map((p) => p[0]);
  const lngs = pts.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 1e-6);
  const lngSpan = Math.max(maxLng - minLng, 1e-6);
  // 종횡비 유지 — 더 긴 축 기준으로 스케일을 통일해 궤적 왜곡을 막는다.
  const scale = Math.min((w - pad * 2) / lngSpan, (h - pad * 2) / latSpan);
  const offX = (w - lngSpan * scale) / 2;
  const offY = (h - latSpan * scale) / 2;
  return pts
    .map((p) => {
      const x = offX + (p[1] - minLng) * scale;
      const y = h - (offY + (p[0] - minLat) * scale);
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`;
    })
    .join(" ");
}

/** 트랙이 길면 그리기 좋게 샘플링(최대 ~200포인트). */
function samplePoints(pts: [number, number][], max = 200): [number, number][] {
  if (pts.length <= max) return pts;
  const step = pts.length / max;
  const out: [number, number][] = [];
  for (let i = 0; i < max; i++) out.push(pts[Math.floor(i * step)]);
  out.push(pts[pts.length - 1]);
  return out;
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const [route, fontData] = await Promise.all([
    getPublicRouteMeta(params.id),
    fontPromise,
  ]);

  const imageOptions = {
    ...size,
    fonts: fontData
      ? [{ name: "SpoqaHanSans", data: fontData, style: "normal" as const, weight: 700 as const }]
      : undefined,
  };

  if (!route) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: INK,
            color: "white",
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, display: "flex" }}>
            <span style={{ color: AMBER }}>K</span>-Riders
          </div>
          <div style={{ fontSize: 36, color: "#94a3b8", marginTop: 20 }}>
            라이더를 위한 라이딩 커뮤니티
          </div>
        </div>
      ),
      imageOptions
    );
  }

  const linePts =
    route.track_points && route.track_points.length >= 2
      ? samplePoints(route.track_points)
      : null;
  const score = route.winding_score != null ? Math.round(Number(route.winding_score)) : null;
  const grade = score != null ? windingGrade(score) : null;

  const statBits: string[] = [];
  if (route.region) statBits.push(route.region);
  if (route.distance_km != null) statBits.push(`${route.distance_km}km`);
  if (route.duration_min != null) {
    const h = Math.floor(route.duration_min / 60);
    const m = route.duration_min % 60;
    statBits.push(h > 0 ? `${h}시간 ${m}분` : `${m}분`);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: INK,
          color: "white",
          padding: 56,
        }}
      >
        {/* 좌측: 텍스트 블록 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 620,
            paddingRight: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: AMBER }}>
              K-Riders · 라이딩 루트
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 800,
                lineHeight: 1.2,
                marginTop: 18,
              }}
            >
              {route.title.length > 32 ? `${route.title.slice(0, 32)}…` : route.title}
            </div>
            <div style={{ display: "flex", fontSize: 32, color: "#94a3b8", marginTop: 18 }}>
              {statBits.join("  ·  ")}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {grade && score != null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 34,
                  fontWeight: 800,
                  color: AMBER,
                }}
              >
                {`${grade.emoji} 와인딩 지수 ${score} · ${grade.label}`}
              </div>
            )}
            {route.moto_safe && (
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#34d399",
                }}
              >
                🛵 이륜차 안전 경로 · 자동차전용도로 미경유
              </div>
            )}
            <div style={{ display: "flex", fontSize: 26, color: "#64748b" }}>
              {`by ${route.author_nickname} · k-roadtrip.app/motorcycle`}
            </div>
          </div>
        </div>

        {/* 우측: 루트 궤적 카드 */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 32,
            border: "2px solid rgba(245,158,11,0.35)",
          }}
        >
          {linePts ? (
            <svg width="420" height="470" viewBox="0 0 420 470">
              <polyline
                points={toPolylinePoints(linePts, 420, 470, 36)}
                fill="none"
                stroke={AMBER}
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div style={{ display: "flex", fontSize: 120 }}>🏍️</div>
          )}
        </div>
      </div>
    ),
    imageOptions
  );
}
