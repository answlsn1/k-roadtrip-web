import Link from "next/link";
import { getPublishedRoutes } from "@/lib/supabase/queries";

// Render per-request: works with or without Supabase env at build time,
// and new routes appear without a redeploy. Switch to ISR when traffic grows.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const routes = await getPublishedRoutes();

  return (
    <main className="mx-auto max-w-5xl px-5 py-14">
      {/* Hero */}
      <header className="mb-12 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          K-RoadTrip · Beyond Seoul
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Escape Seoul. Discover the{" "}
          <span className="text-amber-500">Real Korea</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
          Curated road-trip courses with local-verified stops — preview the
          drive on the map, then navigate with one tap in Naver Map.
        </p>
      </header>

      {/* Route cards */}
      {routes.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-bold text-slate-700">No courses yet</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Connect Supabase (set <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) and run the SQL in{" "}
            <code>supabase/migrations</code> + <code>supabase/seed*.sql</code>.
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
                <h2 className="mt-2 text-lg font-extrabold leading-snug text-white">
                  {r.title_en}
                </h2>
                <p className="mt-1 text-xs font-semibold text-white/75">
                  {r.total_distance != null && `🚗 ${Number(r.total_distance).toFixed(1)} km`}
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

      <footer className="mt-16 text-center text-xs text-slate-400">
        © 2026 K-RoadTrip · Made for travelers who go beyond Seoul
      </footer>
    </main>
  );
}
