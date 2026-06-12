import Link from "next/link";
import CourseSearch from "@/components/home/CourseSearch";
import { getPublishedRoutes } from "@/lib/supabase/queries";

// Render per-request: works with or without Supabase env at build time,
// and new courses appear without a redeploy. Switch to ISR when traffic grows.
export const dynamic = "force-dynamic";

// Woljeonggyo Bridge, Gyeongju — dancheong colors you can only find in Korea
const HERO_IMG =
  "https://images.unsplash.com/photo-1653632445006-0ed9bbe32672?auto=format&fit=crop&w=2000&q=80";

export default async function HomePage() {
  const routes = await getPublishedRoutes();

  return (
    <main>
      {/* ============ NAVBAR ============ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-sm text-white">
              K
            </span>
            K-RoadTrip
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#courses" className="transition-colors hover:text-ink">
              Courses
            </a>
            <a href="#why" className="transition-colors hover:text-ink">
              Why K-RoadTrip
            </a>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden">
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

      {/* ============ COURSES ============ */}
      <section id="courses" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:py-28">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600">
            Curated Routes
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Pick a route. We did the homework.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Hand-built itineraries with only local-verified stops — open a
            course to see every stop on the map.
          </p>
        </div>

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((r) => (
              <Link
                key={r.id}
                href={`/routes/${r.slug}`}
                className="group relative block h-64 overflow-hidden rounded-3xl bg-slate-800 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {r.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.thumbnail_url}
                    alt={r.title_en}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                    {r.region_name_en}
                    {r.region_name_ko ? ` · ${r.region_name_ko}` : ""}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">
                    {r.title_en}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-white/75">
                    {r.total_distance != null &&
                      `🚗 ${Number(r.total_distance).toFixed(1)} km`}
                    {r.total_duration != null && ` · ⏱ ${r.total_duration} min drive`}
                  </p>
                  <p className="mt-3 text-sm font-bold text-amber-300 transition-transform group-hover:translate-x-1">
                    View course →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
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
