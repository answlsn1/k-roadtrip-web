"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import { getMyProfile, ensureProfile, deriveOAuthNickname } from "./auth";
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
          if (cancelled) return;
          if (p2) {
            setProfile(p2);
            return;
          }
          // 최종 안전망 — OAuth(구글/카카오)로 처음 로그인한 유저는 로그인/가입
          // 페이지의 수동 ensureProfile 호출을 거치지 않고 임의 페이지로
          // 리다이렉트될 수 있다. session 은 있는데 재시도까지도 프로필이 없으면
          // 여기서 직접 만든다(멱등이라 다른 경로와 겹쳐도 무해).
          ensureProfile(session.user.id, deriveOAuthNickname(session.user)).then((p3) => {
            if (!cancelled) setProfile(p3);
          });
        });
      }, 1500);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  return { session, profile, loading, isLoggedIn: !!session };
}
