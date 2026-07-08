"use client";

import { useState } from "react";
import { useLangStore } from "@/store/useLangStore";
import { t, tf, type DictKey } from "@/lib/i18n";
import { useTilt } from "@/hooks/useTilt";
import CategoryRoutesModal, { type ModalRoute } from "./CategoryRoutesModal";

export interface CategoryGroup {
  id: string;
  titleKey: DictKey;
  image: string | null;
  routes: ModalRoute[];
}

/**
 * Category tile grid — replaces the long horizontal-scroll rows. Each tile is
 * one category (text + a single representative photo); clicking opens
 * CategoryRoutesModal listing every route in that category.
 */
export default function CategoryTileGrid({ groups }: { groups: CategoryGroup[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const lang = useLangStore((s) => s.lang);
  const openGroup = groups.find((g) => g.id === openId) ?? null;
  // 훅 인스턴스 하나를 전 타일에 공유 — 핸들러가 e.currentTarget 기준이라 안전.
  const tilt = useTilt<HTMLButtonElement>();

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {groups.map((g) => (
          /* 버튼 = 그림자·리프트·틸트 담당. overflow-hidden(클리핑)은 여기서
             하지 않는다 — 자식 img가 GPU 레이어에서 scale 애니메이션되는 동안
             부모의 둥근 클립 래스터화가 프레임마다 풀렸다 잡히며 모서리가
             깜빡이는 Chromium/Safari 합성 버그를 피하기 위해, 클리핑은 아래
             전용 레이어(isolate + translateZ(0))로 분리. */
          <button
            key={g.id}
            onClick={() => setOpenId(g.id)}
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
            className="group relative aspect-[3/4] rounded-3xl text-left shadow-float ring-1 ring-white/10 transition-[transform,box-shadow] [transition-duration:180ms,300ms] ease-out [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateY(var(--ty,0px))_scale(var(--s,1))] hover:[--ty:-6px] active:[--s:0.98] hover:shadow-float-lg hover:ring-amber-300/40 motion-reduce:transition-none motion-reduce:[transform:none]"
          >
            {/* 미디어 클리핑 전용 레이어 — isolate + translateZ(0)로 자체
                스태킹/합성 레이어를 고정해 hover 줌 중에도 둥근 클립이 유지된다.
                (webkit mask는 사파리 구버전 클립 릭 방지 관용구) */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl isolate [transform:translateZ(0)] [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
              {g.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                  <svg className="h-10 w-10 text-white/10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="5.5" cy="5" r="2" fill="currentColor" />
                    <path d="M5.5 7.4v4.6a4 4 0 0 0 4 4h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.1 3.2" />
                    <circle cx="18.5" cy="18" r="2" fill="currentColor" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 via-35% to-transparent to-70%" />
            </div>
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-slate-950/55 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md">
                {tf("library.routeCount", lang, { n: g.routes.length })}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 pr-14">
              <h3 className="text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-md sm:text-xl">
                {t(g.titleKey, lang)}
              </h3>
            </div>
            <span
              aria-hidden
              className="absolute bottom-4 right-4 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors duration-300 group-hover:bg-amber-300 group-hover:text-slate-900 motion-reduce:transition-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}
      </div>
      {openGroup && (
        <CategoryRoutesModal titleKey={openGroup.titleKey} routes={openGroup.routes} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
