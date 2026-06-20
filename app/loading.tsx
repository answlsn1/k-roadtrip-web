/* Route-level loading skeleton — mirrors the home layout (top bar · hero ·
 * a row of course cards) so the app's structure is visible while data loads,
 * instead of a bare spinner. */
export default function Loading() {
  return (
    <main className="min-h-[100dvh] bg-white" aria-busy="true" aria-label="Loading">
      {/* Top bar */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-5">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200" />
      </div>

      {/* Hero */}
      <div className="relative grid min-h-[60dvh] place-items-center bg-slate-100">
        <div className="w-full max-w-2xl px-5 text-center">
          <div className="mx-auto h-4 w-64 animate-pulse rounded-full bg-slate-200" />
          <div className="mx-auto mt-5 h-10 w-3/4 animate-pulse rounded-xl bg-slate-200" />
          <div className="mx-auto mt-3 h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
          <div className="mx-auto mt-6 h-12 w-full max-w-md animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>

      {/* Card row */}
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-5 flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[400px] w-[300px] shrink-0 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
