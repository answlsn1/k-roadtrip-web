import CoursesSectionHeader from "@/components/home/CoursesSectionHeader";
import HeroContent from "@/components/home/HeroContent";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import MapSection from "@/components/home/MapSection";
import Navbar from "@/components/home/Navbar";
import RoadTripTips from "@/components/home/RoadTripTips";
import RouteVideoCard from "@/components/home/RouteVideoCard";
import CategoryRow from "@/components/home/CategoryRow";
import SiteFooter from "@/components/home/SiteFooter";
import SponsoredCard from "@/components/home/SponsoredCard";
import AffiliateDisclosure from "@/components/home/AffiliateDisclosure";
import ValueProps from "@/components/home/ValueProps";
import RecommendBanner from "@/components/home/RecommendBanner";
import { getPublishedRoutes, getAllWaypointsForMap } from "@/lib/data/queries";
import { getCardMeta, getRouteVideoUrl } from "@/lib/config/cardMeta";
import { SPONSORED_PLACES } from "@/lib/config/sponsored";
import type { Route } from "@/lib/types";

// Render per-request: works with or without Supabase env at build time,
// and new courses appear without a redeploy. Switch to ISR when traffic grows.
export const dynamic = "force-dynamic";

// ── Netflix-style feed categories ───────────────────────────────────────────
const FEED_CATEGORIES = [
  {
    id: "trending",
    titleKey: "feed.trending",
    slugs: ["jeju-volcanic-loop", "busan-coastal-metropolis", "gangneung-coastal-drive"],
  },
  {
    id: "beyond",
    titleKey: "feed.beyond",
    slugs: [
      "misty-tea-roads",
      "south-sea-island-hop",
      "danyang-river-cliffs",
      "west-coast-sunset-line",
      "jeongseon-snow-highlands",
    ],
  },
  {
    id: "heritage",
    titleKey: "feed.heritage",
    slugs: [
      "gyeongju-heritage-loop",
      "andong-scholars-riverside-drive",
      "gyeongju-ancient-capital-drive",
      "jeonju-wanju-hanok-drive",
    ],
  },
  {
    id: "ocean",
    titleKey: "feed.ocean",
    slugs: ["gangneung-coastal-drive", "busan-coastal-metropolis"],
  },
] as const;

export default async function HomePage() {
  const [routes, mapWaypoints] = await Promise.all([
    getPublishedRoutes(),
    getAllWaypointsForMap(),
  ]);

  return (
    <main>
      {/* ============ NAVBAR ============ */}
      <Navbar />

      {/* ============ HERO ============ */}
      {/* Full viewport height. svh handles mobile browser chrome; screen is the fallback. */}
      <section className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden">
        <HeroSlideshow />

        <HeroContent
          courses={routes.map((r) => ({
            slug: r.slug,
            title_en: r.title_en,
            title_ko: r.title_ko,
            region_name_en: r.region_name_en,
            region_name_ko: r.region_name_ko,
            theme_tags: r.theme_tags,
            total_distance: r.total_distance,
          }))}
        />
      </section>

      {/* ============ COURSES — Netflix-style feed ============ */}
      <section id="courses" className="scroll-mt-20 py-20 sm:py-28">
        <CoursesSectionHeader />

        {routes.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">Routes are coming soon</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              We&apos;re curating new local-verified road trips across Korea.
              Check back shortly!
            </p>
          </div>
        ) : (
          <div className="sm:mx-auto sm:max-w-6xl">
            {FEED_CATEGORIES.map((cat) => {
              const cards = cat.slugs
                .map((slug) => routes.find((r) => r.slug === slug))
                .filter((r): r is Route => Boolean(r));
              if (cards.length === 0) return null;
              return (
                <CategoryRow key={cat.id} titleKey={cat.titleKey}>
                  {cards.map((r) => (
                    <div key={r.id} className="snap-start shrink-0 w-[300px] sm:w-[340px]">
                      <RouteVideoCard
                        slug={r.slug}
                        title_en={r.title_en}
                        title_ko={r.title_ko ?? undefined}
                        thumbnail_url={r.thumbnail_url}
                        video_url={getRouteVideoUrl(r.slug)}
                        meta={getCardMeta(r.slug)}
                        sizeClass="h-[400px] w-full"
                      />
                    </div>
                  ))}
                </CategoryRow>
              );
            })}

            {/* ⭐ Sponsored Picks row — hidden until real partners are added */}
            {SPONSORED_PLACES.length > 0 && (
              <>
                <CategoryRow
                  titleKey="feed.sponsored"
                  badgeKey="feed.partner"
                  badgeClass="bg-amber-100 text-amber-700"
                >
                  {SPONSORED_PLACES.map((place) => (
                    <SponsoredCard key={place.sourceId} place={place} />
                  ))}
                </CategoryRow>
                <AffiliateDisclosure className="-mt-6 mb-10 px-5 text-xs text-slate-400 sm:px-0" />
              </>
            )}
          </div>
        )}
      </section>

      {/* ============ MAP ============ */}
      {mapWaypoints.length > 0 && <MapSection waypoints={mapWaypoints} />}

      {/* ============ ROAD TRIP TIPS ============ */}
      <RoadTripTips />

      {/* ============ VALUE PROPS ============ */}
      <ValueProps />

      {/* ============ RECOMMEND (KO only) ============ */}
      <RecommendBanner />

      {/* ============ FOOTER ============ */}
      <SiteFooter />
    </main>
  );
}
