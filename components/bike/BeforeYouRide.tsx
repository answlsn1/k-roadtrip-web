"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/** Bilingual tips — kept local since they're presentational content (mirrors RoadTripTips.tsx). */
const TIPS = [
  {
    icon: "🎫",
    en: {
      title: "Get a Bike Passport",
      desc: "Buy one (~₩4,000) at any staffed certification center, then self-stamp at the red unmanned booths along the way — open 24/7.",
    },
    ko: {
      title: "인증수첩부터 구매하세요",
      desc: "유인 인증센터에서 인증수첩(약 4,000원)을 사고, 길을 따라 있는 빨간 무인 부스에서 직접 도장을 찍으면 됩니다 — 24시간 운영.",
    },
  },
  {
    icon: "🚆",
    en: {
      title: "Trains are picky about bikes",
      desc: "KTX high-speed trains generally don't take full-size bikes. Regular intercity trains sometimes allow them — check ahead, or bring a folding bike.",
    },
    ko: {
      title: "기차는 자전거 반입이 까다로워요",
      desc: "KTX 고속열차는 일반 자전거 반입이 어렵습니다. 무궁화·ITX 등 일반열차는 노선에 따라 가능하니 미리 확인하거나, 접이식 자전거를 준비하세요.",
    },
  },
  {
    icon: "🚲",
    en: {
      title: "One-way rental is real",
      desc: "Several rental shops let you pick up in Seoul and drop off in Busan or Jeju — you don't need to bring your own bike for the full trip.",
    },
    ko: {
      title: "편도 대여도 가능해요",
      desc: "서울에서 빌려 부산이나 제주에서 반납하는 편도 대여 업체들이 있습니다. 자전거를 직접 가져올 필요는 없어요.",
    },
  },
  {
    icon: "🏅",
    en: {
      title: "Chase a medal",
      desc: "Stamp all Four Rivers (Han, Nakdong, Geum, Yeongsan) for the Four Rivers Medal, or all 12 routes for the Grand Slam.",
    },
    ko: {
      title: "메달에 도전해 보세요",
      desc: "한강·낙동강·금강·영산강 4대강을 완주하면 4대강 메달, 전체 12개 노선을 완주하면 그랜드슬램 메달을 받을 수 있어요.",
    },
  },
  {
    icon: "💳",
    en: {
      title: "Medal orders need Korean payment",
      desc: "The online medal-ordering system usually needs a Korean card. Ask your accommodation or the staff at the final certification center for help.",
    },
    ko: {
      title: "메달 주문은 한국 결제수단이 필요해요",
      desc: "온라인 메달 신청은 보통 한국 카드가 필요합니다. 숙소 직원이나 마지막 인증센터 담당자에게 도움을 요청해 보세요.",
    },
  },
  {
    icon: "⛰",
    en: {
      title: "Respect the Saejae climb",
      desc: "The Ihwaryeong Pass is the only real mountain climb in the whole network. Pace yourself, and consider a rest day before or after.",
    },
    ko: {
      title: "새재 고갯길은 만만치 않아요",
      desc: "이화령 고개는 전체 노선 중 유일한 진짜 오르막입니다. 무리하지 말고, 전후로 휴식일을 두는 걸 추천해요.",
    },
  },
] as const;

export default function BeforeYouRide() {
  const lang = useLangStore((s) => s.lang);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
      <div className="rounded-3xl bg-ink px-7 py-8 sm:px-10 sm:py-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          {t("bike.tips.label", lang)}
        </p>
        <h3 className="mb-6 text-xl font-extrabold text-white sm:text-2xl">
          {t("bike.tips.heading", lang)}
        </h3>
        <div className="grid gap-6 sm:grid-cols-3">
          {TIPS.map((tip) => (
            <div key={tip.en.title}>
              <p className="mb-1.5 text-sm font-bold text-white">
                {tip.icon} {tip[lang].title}
              </p>
              <p className="text-sm leading-relaxed text-slate-400">{tip[lang].desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
