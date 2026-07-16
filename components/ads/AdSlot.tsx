"use client";

import { useEffect } from "react";
import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";
import {
  adsEnabled,
  ADSENSE_CLIENT,
  ADSENSE_SLOTS,
  type AdSlotId,
} from "@/lib/config/ads";

/* ============================================================
 * AdSlot — Google AdSense 수동 배치 유닛 (홈 전용)
 *   배치 규칙: 광고는 절대 지도 핸드오프/예약 CTA 흐름 안에 넣지 않는다
 *   (전환 funnel 보호) — 홈 콘텐츠 섹션 사이만 허용.
 *   게이트: env 미설정(adsEnabled=false) 또는 슬롯 ID 없음 → null 렌더,
 *   광고 관련 DOM이 전혀 출력되지 않는다(런칭 헌장 §5).
 *   신뢰 규칙: 유닛 위에 "Advertisement/광고" 라벨을 항상 표시해
 *   콘텐츠로 오인되지 않게 한다. 가짜/플레이스홀더 크리에이티브는 금지 —
 *   개발용 표시는 NODE_ENV !== "production" 에서만 outline으로 노출.
 * ============================================================ */

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ slot }: { slot: AdSlotId }) {
  const lang = useLangStore((s) => s.lang);
  const slotId = ADSENSE_SLOTS[slot];
  const enabled = adsEnabled && slotId.length > 0;

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 광고 로드 실패는 UX를 절대 막지 않는다 — 조용히 무시.
    }
  }, [enabled]);

  if (!enabled) return null;

  // 빌드 시점에 인라인되어 프로덕션 번들에서는 dev 표시 코드가 제거된다.
  const isDev = process.env.NODE_ENV !== "production";

  return (
    // ad-slot-wrap: 구글이 광고를 못 채우면(data-ad-status="unfilled" — 심사
    // 기간·무채움) 라벨·예약 공간까지 통째로 접는다(globals.css :has 규칙).
    // 빈 광고 박스를 사용자에게 보여주지 않기 위함 — 구글 권장 패턴.
    <div className="ad-slot-wrap mx-auto max-w-6xl px-5 py-10">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {t("ads.label", lang)}
      </p>
      {/* CLS 방지: 광고가 채워지기 전에도 min-height로 자리를 예약해
          아래 섹션이 밀리지 않게 한다 (모바일 280px / 데스크톱 250px). */}
      <div
        className={`relative min-h-[280px] sm:min-h-[250px] ${
          isDev ? "rounded-2xl border border-dashed border-slate-200" : ""
        }`}
      >
        {isDev && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-[10px] font-semibold uppercase tracking-widest text-slate-300">
            Ad slot (dev)
          </span>
        )}
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
