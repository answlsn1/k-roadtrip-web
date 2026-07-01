import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import BikeHero from "@/components/bike/BikeHero";
import BikeRouteCard from "@/components/bike/BikeRouteCard";
import RoutesSectionHeader from "@/components/bike/RoutesSectionHeader";
import BeforeYouRide from "@/components/bike/BeforeYouRide";
import BikeValueProps from "@/components/bike/BikeValueProps";
import PassportTracker from "@/components/bike/PassportTracker";
import SiteFooter from "@/components/home/SiteFooter";
import CategoryRow from "@/components/home/CategoryRow";
import { BIKE_ROUTES } from "@/lib/config/bikeRoutes";
import type { DictKey } from "@/lib/i18n";

/* ============================================================
 * Bike-RoadTrip 홈 — /(car) 의 자전거 버전.
 *   대한민국 국토종주 자전거길(12개 공식 노선, 실데이터)을 기반으로
 *   구성. app/page.tsx 와 같은 섹션 리듬(히어로 → 코스 피드 → 팁 →
 *   가치제안 → 푸터)을 따르되, 콘텐츠는 전부 자전거 여행 관점으로
 *   새로 썼다. 델라이트 포인트: "내 인증수첩"(PassportTracker) —
 *   실제 종이 인증수첩 스탬프 시스템을 본뜬 완주 체크리스트.
 * ============================================================ */

export const metadata: Metadata = {
  title: "Bike-RoadTrip · Cycle Korea's Official National Bike Paths",
  description:
    "12 official government-built cycling routes across Korea — rivers, coasts, and the legendary Saejae mountain pass. Certification-stamp system explained for foreign riders.",
};

const BIKE_FEED_CATEGORIES: { id: string; titleKey: DictKey; slugs: string[] }[] = [
  {
    id: "fourRivers",
    titleKey: "bike.cat.fourRivers",
    slugs: ["hangang", "nakdonggang", "geumgang", "yeongsangang"],
  },
  {
    id: "coastal",
    titleKey: "bike.cat.coastal",
    slugs: ["donghae-gangwon", "donghae-gyeongbuk"],
  },
  {
    id: "mountain",
    titleKey: "bike.cat.mountain",
    slugs: ["saejae"],
  },
  {
    id: "island",
    titleKey: "bike.cat.island",
    slugs: ["jeju"],
  },
  {
    id: "more",
    titleKey: "bike.cat.more",
    slugs: ["ara", "bukhangang", "seomjingang", "ocheon"],
  },
];

export default function BikeHomePage() {
  return (
    <main>
      <Navbar mode="bike" />

      <section className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden">
        <HeroSlideshow />
        <BikeHero />
      </section>

      <section id="routes" className="scroll-mt-20 py-20 sm:py-28">
        <RoutesSectionHeader />
        <div className="sm:mx-auto sm:max-w-6xl">
          {BIKE_FEED_CATEGORIES.map((cat) => {
            const routes = cat.slugs
              .map((slug) => BIKE_ROUTES.find((r) => r.slug === slug))
              .filter((r): r is NonNullable<typeof r> => Boolean(r));
            if (routes.length === 0) return null;
            return (
              <CategoryRow key={cat.id} titleKey={cat.titleKey}>
                {routes.map((r) => (
                  <BikeRouteCard key={r.slug} route={r} />
                ))}
              </CategoryRow>
            );
          })}
        </div>
      </section>

      <PassportTracker />

      <BeforeYouRide />

      <BikeValueProps />

      <SiteFooter />
    </main>
  );
}
