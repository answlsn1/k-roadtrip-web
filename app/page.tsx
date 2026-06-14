import Link from "next/link";
import CourseSearch from "@/components/home/CourseSearch";
import CoursesSectionHeader from "@/components/home/CoursesSectionHeader";
import MapSection from "@/components/home/MapSection";
import Navbar from "@/components/home/Navbar";
import RouteVideoCard from "@/components/home/RouteVideoCard";
import CategoryRow from "@/components/home/CategoryRow";
import SponsoredCard from "@/components/home/SponsoredCard";
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
    title: "🔥 Trending in Korea",
    slugs: ["jeju-volcanic-loop", "busan-coastal-metropolis", "gangneung-coastal-drive"],
  },
  {
    id: "heritage",
    title: "🏛 History & Culture",
    slugs: [
      "gyeongju-heritage-loop",
      "andong-scholars-riverside-drive",
      "gyeongju-ancient-capital-drive",
      "jeonju-wanju-hanok-drive",
    ],
  },
  {
    id: "ocean",
    title: "🌊 Ocean Views",
    slugs: ["gangneung-coastal-drive", "busan-coastal-metropolis"],
  },
] as const;

// Woljeonggyo Bridge, Gyeongju — dancheong colors you can only find in Korea
const HERO_IMG =
  "https://images.unsplash.com/photo-1653632445006-0ed9bbe32672?auto=format&fit=crop&w=2000&q=80";

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
      <section className="relative flex min-h-[88vh] items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt="Woljeonggyo Bridge illuminated at night in Gyeongju, Korea"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-slate-950/75" />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 pt-24 text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 backdrop-blur">
            🚗 Local-verified road trips · Sokcho → Busan + Jeju
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Escape Seoul.
            <br className="sm:hidden" /> Discover the{" "}
            <span className="text-amber-300">Real Korea</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Explore scenic routes, trusted local food, and hidden gems with
            zero navigation stress.
          </p>

          <CourseSearch
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

          <p className="mt-6 text-xs text-white/60">
            No login · No ads · 100% free local guide
          </p>
        </div>
      </section>

      {/* ============ COURSES — Netflix-style feed ============ */}
      <section id="courses" className="scroll-mt-20 py-20 sm:py-28">
        <CoursesSectionHeader />

        {routes.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-bold text-slate-700">No courses yet</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Connect Supabase (set <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>), run the SQL in{" "}
              <code>supabase/migrations</code> + <code>supabase/seed*.sql</code>,
              then redeploy.
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
                <CategoryRow key={cat.id} title={cat.title}>
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

            {/* ⭐ Sponsored Picks row */}
            <CategoryRow
              title="⭐ Sponsored Picks"
              badge="Partner"
              badgeClass="bg-amber-100 text-amber-700"
            >
              {SPONSORED_PLACES.map((place) => (
                <SponsoredCard key={place.sourceId} place={place} />
              ))}
            </CategoryRow>
          </div>
        )}
      </section>

      {/* ============ MAP ============ */}
      {mapWaypoints.length > 0 && <MapSection waypoints={mapWaypoints} />}

      {/* ============ ROAD TRIP TIPS ============ */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:pb-28">
        <div className="rounded-3xl bg-ink px-7 py-8 sm:px-10 sm:py-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            Before You Drive
          </p>
          <h3 className="mb-6 text-xl font-extrabold text-white sm:text-2xl">
            What road-trippers wish they&apos;d known
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: "🪪", title: "IDP is a must", desc: "Rental companies require an International Driving Permit (1949 convention) along with your home license and passport." },
              { icon: "🛣", title: "Get a Hi-Pass card", desc: "Expressway tolls are electronic. Rent a Hi-Pass card with your car and settle the balance when you return it." },
              { icon: "⛽", title: "Don't skip the hyugeso", desc: "Korean highway rest stops (hyugeso) are food destinations in their own right — walnut cakes, udon, full meals." },
              { icon: "📵", title: "Save offline maps", desc: "Mountain stretches between coastal towns can drop signal. Download offline areas in Naver Map before leaving the city." },
              { icon: "🌙", title: "Eat dinner early", desc: "Rural kitchens close early — or randomly. Don't count on a late dinner once you're off the highway." },
              { icon: "📞", title: "Booking? Ask your hotel", desc: "Naver reservations need a Korean phone number. Hotel front desks will happily call for you — most places outside Seoul are walk-in anyway." },
            ].map((tip) => (
              <div key={tip.title}>
                <p className="mb-1.5 text-sm font-bold text-white">{tip.icon} {tip.title}</p>
                <p className="text-sm leading-relaxed text-slate-400">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VALUE PROPS ============ */}
      <section id="why" className="border-y border-slate-200/70 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
              Why K-RoadTrip
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Built for travelers, not tourists
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                🔍
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-ink">No Typo Stress</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Spell it however you want. Our fuzzy search understands missing
                spaces and rough romanization — and still finds the right course.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-green-100 text-naver">
                🧭
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-ink">1-Click Naver Sync</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                One tap sends exact coordinates straight into Naver Map — the
                navigation app Korea runs on. No typing, no copy-paste.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-500">
                ✅
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-ink">Local-Verified Only</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Every place is chosen by local review volume — the signal
                residents themselves trust. No ads, no paid placements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-10 text-xs text-slate-400 sm:flex-row">
        <p>© 2026 K-RoadTrip · Made for travelers who go beyond Seoul</p>
        <p>Map data © Google · Navigation by Naver Map</p>
      </footer>
    </main>
  );
}
