"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import AuthModal from "@/components/auth/AuthModal";
import { trackRouteEvent } from "@/lib/analytics";

/* Soft gating: browsing is never blocked — the auth prompt appears
 * only at the moment of intent (tapping Save while signed out).
 * The intent survives the OAuth redirect via localStorage, so the
 * route is saved automatically the moment the user comes back. */
const PENDING_SAVE_KEY = "krt-pending-save-route";

interface SaveRouteButtonProps {
  routeId: number;
  className?: string;
}

export default function SaveRouteButton({ routeId, className = "" }: SaveRouteButtonProps) {
  const supabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  /* track auth session */
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  /* load saved state — and complete a save that was interrupted by login */
  useEffect(() => {
    if (!session) {
      setSaved(false);
      return;
    }
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_saved_routes")
        .select("route_id")
        .eq("route_id", routeId)
        .maybeSingle();
      if (cancelled) return;

      let isSaved = Boolean(data);

      const pending = localStorage.getItem(PENDING_SAVE_KEY);
      if (pending === String(routeId)) {
        localStorage.removeItem(PENDING_SAVE_KEY);
        if (!isSaved) {
          const { error } = await supabase
            .from("user_saved_routes")
            .upsert(
              { user_id: session.user.id, route_id: routeId },
              { onConflict: "user_id,route_id", ignoreDuplicates: true }
            );
          if (!error) {
            isSaved = true;
            trackRouteEvent("route_save", { routeId });
          }
        }
        setAuthOpen(false);
      }

      if (!cancelled) setSaved(isSaved);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, routeId, supabase]);

  const toggle = useCallback(async () => {
    if (busy || !supabase) return;

    /* --- soft gate: signed out → remember intent, prompt login --- */
    if (!session) {
      localStorage.setItem(PENDING_SAVE_KEY, String(routeId));
      setAuthOpen(true);
      return;
    }

    /* --- signed in: optimistic toggle, revert on failure --- */
    setBusy(true);
    const next = !saved;
    setSaved(next);
    const { error } = next
      ? await supabase
          .from("user_saved_routes")
          .upsert(
            { user_id: session.user.id, route_id: routeId },
            { onConflict: "user_id,route_id", ignoreDuplicates: true }
          )
      : await supabase.from("user_saved_routes").delete().eq("route_id", routeId);
    if (error) setSaved(!next);
    else if (next) trackRouteEvent("route_save", { routeId });
    setBusy(false);
  }, [busy, session, saved, routeId, supabase]);

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved routes" : "Save this route"}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all active:scale-90 ${
          saved
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:text-rose-400"
        } ${className}`}
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21C12 21 3 15.5 3 9.5C3 6.4 5.4 4 8.4 4C10 4 11.3 4.8 12 6C12.7 4.8 14 4 15.6 4C18.6 4 21 6.4 21 9.5C21 15.5 12 21 12 21Z"
          />
        </svg>
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          localStorage.removeItem(PENDING_SAVE_KEY); // user backed out — drop the intent
        }}
      />
    </>
  );
}
