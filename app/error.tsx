"use client";

/* Segment-level error boundary: a data-fetching or rendering crash
 * shows this card instead of a blank screen, with one-tap retry. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-white px-5">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-3xl">🚧</p>
        <h1 className="mt-3 text-lg font-extrabold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          The road hit a pothole. Try again — if it keeps happening, the
          database connection (Supabase env vars) is the usual suspect.
        </p>
        {error.digest && (
          <p className="mt-2 text-[10px] text-slate-400">ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-5 w-full rounded-2xl bg-ink py-3 text-sm font-extrabold text-white transition-transform active:scale-[0.99]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
