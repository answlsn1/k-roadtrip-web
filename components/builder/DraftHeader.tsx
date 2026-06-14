"use client";

import { useState } from "react";
import Link from "next/link";
import { useBuilderStore } from "@/store/useBuilderStore";

export default function DraftHeader() {
  const title = useBuilderStore((s) => s.draft.title);
  const stopCount = useBuilderStore((s) => s.draft.stops.length);
  const renameDraft = useBuilderStore((s) => s.renameDraft);
  const resetDraft = useBuilderStore((s) => s.resetDraft);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 transition-colors hover:text-slate-700"
        >
          ← K-RoadTrip
        </Link>
        {stopCount > 0 &&
          (confirming ? (
            <span className="flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  resetDraft();
                  setConfirming(false);
                }}
                className="font-bold text-rose-500 hover:text-rose-600"
              >
                Clear all?
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="font-semibold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          ))}
      </div>

      <input
        value={title}
        onChange={(e) => renameDraft(e.target.value)}
        placeholder="Name your route"
        className="mt-2 w-full bg-transparent text-xl font-extrabold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
      />
      <p className="mt-0.5 text-xs font-semibold text-emerald-600">
        Build your own road trip · saved on this device
      </p>
    </div>
  );
}
