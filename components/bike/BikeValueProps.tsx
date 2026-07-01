"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

const PROPS = [
  {
    icon: "🏛️",
    iconClass: "bg-sky-100 text-sky-600",
    en: {
      title: "Real, Official Routes",
      desc: "Every path here is part of Korea's actual government-built cycling network — not a marketing suggestion, an actual road that exists on the ground.",
    },
    ko: {
      title: "실제 공식 노선",
      desc: "여기 있는 모든 길은 대한민국 정부가 실제로 조성한 자전거길입니다 — 마케팅용 추천이 아니라, 실제로 존재하는 길이에요.",
    },
  },
  {
    icon: "🎫",
    iconClass: "bg-amber-100 text-amber-600",
    en: {
      title: "Certification, Explained",
      desc: "Korea's stamp-passport system is a delight once you understand it. We translate how it actually works for first-time visitors.",
    },
    ko: {
      title: "인증 시스템까지 친절하게",
      desc: "인증수첩·인증센터 시스템은 알고 나면 정말 재밌는 문화예요. 처음 오는 외국인도 이해할 수 있게 풀어드립니다.",
    },
  },
  {
    icon: "🚲",
    iconClass: "bg-emerald-100 text-emerald-600",
    en: {
      title: "Built for Every Rider",
      desc: "From Jeju's flat coastal loop to the Saejae mountain climb, there's a route here for every fitness level and trip length.",
    },
    ko: {
      title: "실력에 상관없이",
      desc: "제주의 평탄한 해안 코스부터 새재의 고갯길 도전까지, 체력과 일정에 맞는 노선을 고를 수 있어요.",
    },
  },
] as const;

export default function BikeValueProps() {
  const lang = useLangStore((s) => s.lang);

  return (
    <section id="why" className="border-y border-slate-200/70 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t("bike.why.label", lang)}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("bike.why.heading", lang)}
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
