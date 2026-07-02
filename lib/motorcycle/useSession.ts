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
    let cancelled = false;
    getMyProfile().then((p) => {
      if (cancelled) return;
      if (p) {
        setProfile(p);
        return;
      }
      // 가입 직후에는 세션 이벤트가 프로필 insert(ensureProfile)보다 먼저
      // 도착할 수 있다 — 잠시 뒤 한 번만 재시도해 첫 렌더 닉네임 폴백을 줄인다.
      window.setTimeout(() => {
        if (cancelled) return;
        getMyProfile().then((p2) => {
          if (!cancelled) setProfile(p2);
        });
      }, 1500);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return { session, profile, loading, isLoggedIn: !!session };
}
