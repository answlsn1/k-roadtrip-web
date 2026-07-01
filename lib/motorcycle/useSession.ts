"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import { getMyProfile } from "./auth";
import type { MotorcycleProfile } from "./types";

/** Reactive auth session + rider profile — use in any client component under /motorcycle. */
export function useMotorcycleSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MotorcycleProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    getMyProfile().then(setProfile);
  }, [session]);

  return { session, profile, loading, isLoggedIn: !!session };
}
