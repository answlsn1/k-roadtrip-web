"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

const PROPS = [
  {
    icon: "🔍",
    iconClass: "bg-emerald-100 text-emerald-600",
    en: {
      title: "No Typo Stress",
      desc: "Spell it however you want. Our fuzzy search understands missing spaces and rough romanization — and still finds the right course.",
    },
    ko: {
      title: "오타 걱정 없이",
      desc: "철자는 마음대로 적으세요. 퍼지 검색이 띄어쓰기 실수나 어설픈 로마자 표기도 알아듣고 알맞은 코스를 찾아줍니다.",
    },
  },
  {
    icon: "🧭",
    iconClass: "bg-green-100 text-naver",
    en: {
      title: "1-Click Naver Sync",
      desc: "One tap sends exact coordinates straight into Naver Map — the navigation app Korea runs on. No typing, no copy-paste.",
    },
    ko: {
      title: "원클릭 네이버 연동",
      desc: "한 번의 탭으로 정확한 좌표를 네이버 지도에 바로 보냅니다 — 한국이 쓰는 내비게이션 앱으로. 타이핑도, 복사·붙여넣기도 필요 없습니다.",
    },
  },
  {
    icon: "✅",
    iconClass: "bg-rose-100 text-rose-500",
    en: {
      title: "Local-Verified Only",
      desc: "Every place is chosen by local review volume — the signal residents themselves trust. No ads, no paid placements.",
    },
    ko: {
      title: "현지 검증 장소만",
      desc: "모든 장소는 현지 리뷰 수를 기준으로 선정됩니다 — 주민들이 직접 신뢰하는 신호로. 광고도, 돈 받은 노출도 없습니다.",
    },
  },
] as const;

export default function ValueProps() {
  const lang = useLangStore((s) => s.lang);

  return (
    <section id="why" className="border-y border-slate-200/70 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t("why.label", lang)}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("why.heading", lang)}
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROPS.map((p) => (
            <div
              key={p.en.title}
              className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl text-2xl ${p.iconClass}`}
              >
                {p.icon}
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-ink">{p[lang].title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{p[lang].desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
