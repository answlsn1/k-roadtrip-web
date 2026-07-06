"use client";

import { useLangStore } from "@/store/useLangStore";
import { t } from "@/lib/i18n";

/** Bilingual tips — kept local since they're presentational content. */
const TIPS = [
  {
    icon: "🪪",
    en: {
      title: "IDP is a must",
      desc: "Rental companies require an International Driving Permit (1949 convention) along with your home license and passport.",
    },
    ko: {
      title: "국제운전면허증은 필수",
      desc: "렌터카 업체는 1949년 협약 국제운전면허증(IDP)과 본국 면허증, 여권을 함께 요구합니다.",
    },
  },
  {
    icon: "🛣",
    en: {
      title: "Get a Hi-Pass card",
      desc: "Expressway tolls are electronic. Rent a Hi-Pass card with your car and settle the balance when you return it.",
    },
    ko: {
      title: "하이패스 카드를 챙기세요",
      desc: "고속도로 통행료는 전자식입니다. 차와 함께 하이패스 카드를 빌리고 반납할 때 정산하면 됩니다.",
    },
  },
  {
    icon: "⛽",
    en: {
      title: "Don't skip the hyugeso",
      desc: "Korean highway rest stops (hyugeso) are food destinations in their own right — walnut cakes, udon, full meals.",
    },
    ko: {
      title: "휴게소를 그냥 지나치지 마세요",
      desc: "한국 고속도로 휴게소는 그 자체로 맛집입니다 — 호두과자, 우동, 든든한 한 끼까지.",
    },
  },
  {
    icon: "📵",
    en: {
      title: "Save offline maps",
      desc: "Mountain stretches between coastal towns can drop signal. Download offline areas in Naver Map before leaving the city.",
    },
    ko: {
      title: "오프라인 지도를 저장하세요",
      desc: "해안 마을 사이 산길 구간은 신호가 끊길 수 있습니다. 도시를 떠나기 전 네이버 지도에서 오프라인 지역을 받아두세요.",
    },
  },
  {
    icon: "🌙",
    en: {
      title: "Eat dinner early",
      desc: "Rural kitchens close early — or randomly. Don't count on a late dinner once you're off the highway.",
    },
    ko: {
      title: "저녁은 일찍 드세요",
      desc: "시골 식당은 일찍, 때로는 예고 없이 문을 닫습니다. 고속도로를 벗어났다면 늦은 저녁은 기대하지 마세요.",
    },
  },
  {
    icon: "📞",
    en: {
      title: "Booking? Ask your hotel",
      desc: "Naver reservations need a Korean phone number. Hotel front desks will happily call for you — most places outside Seoul are walk-in anyway.",
    },
    ko: {
      title: "예약은 호텔에 부탁하세요",
      desc: "네이버 예약에는 한국 전화번호가 필요합니다. 호텔 프런트가 대신 전화해 줍니다 — 서울 밖 대부분은 어차피 워크인 가능합니다.",
    },
  },
] as const;

export default function RoadTripTips() {
  const lang = useLangStore((s) => s.lang);

  return (
    // Design v2: promoted from an ink card to a full-bleed dark section —
    // gives the light-based home one deep "ink" beat before the footer echoes it.
    <section className="bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300">
          {t("tips.label", lang)}
        </p>
        {/* h2: section-level heading — editorial scale to match the other
            home sections now that this is a full section, not a card. */}
        <h2 className="mb-10 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
          {t("tips.heading", lang)}
        </h2>
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
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
