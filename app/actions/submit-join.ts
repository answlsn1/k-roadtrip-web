'use server';

/* ============================================================
 * 동행단 초대(Join Companion) — 제출 Server Action
 *   클라(Phase 2 UI)가 폼 값을 넘기면 서버에서 검증 후
 *   public.join_submissions 에 anon insert(RLS anon-insert 정책 경유).
 *
 *   방어 우선순위: 허니팟 > 서버측 검증 > (best-effort) throttle.
 *   user_agent/referrer 는 클라값을 믿지 않고 서버 headers() 로 채운다.
 *   에러는 PII/내부정보를 노출하지 않는 일반 코드만 돌려준다.
 * ============================================================ */

import { headers } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/data/supabaseServer';
import { getSupabaseAdminClient } from '@/lib/data/supabaseAdmin';
import {
  CONTACT_TYPES,
  PLAN,
  SPOT_PREF,
  PAINS,
  type ContactType,
  type Plan,
  type SpotPref,
  type Pain,
} from '@/lib/join/constants';

/** 클라가 넘기는 입력. 자유 텍스트는 모두 선택. */
export interface SubmitJoinInput {
  // 필수 연락처
  name: string;
  contactType: ContactType;
  contact: string;

  // 옵트인
  wantInterview: boolean;
  wantPrototype: boolean;

  // 부가(전부 선택)
  word?: string | null;
  travelType?: string | null;
  plan?: Plan | null;
  spotPref?: SpotPref | null;
  recRegion?: string | null;
  recSpot?: string | null;
  pain?: Pain | null;
  painText?: string | null;
  source?: string | null;

  // 세션 식별(throttle 용, 선택) — PII 아님(브라우저 랜덤 id)
  sessionId?: string | null;

  // 🐝 허니팟: 사람은 비워둔다. 봇이 채우면 조용히 드롭.
  company?: string | null;
}

type Result = { ok: true } | { ok: false; error: string };

// 길이 캡 ─ 과다 입력/페이로드 폭주 방지
const NAME_MAX = 80;
const CONTACT_MAX = 120;
const FREE_TEXT_MAX = 280;

/** 문자열 정규화: trim 후 max 로 컷. 빈 문자열/비문자열은 null. */
function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t.slice(0, max) : null;
}

/** 허용 목록에 없으면 null 로 떨어뜨린다(거부가 아니라 무시). */
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : null;
}

export async function submitJoin(input: SubmitJoinInput): Promise<Result> {
  // ── 0. 허니팟 — 채워져 있으면 성공처럼 반환하고 insert 안 함 ──
  // (봇에게 실패 신호를 주지 않기 위해 의도적으로 {ok:true}.)
  if (typeof input.company === 'string' && input.company.trim().length > 0) {
    return { ok: true };
  }

  // ── 1. 필수 필드 검증 ──
  const name = clean(input.name, NAME_MAX);
  const contact = clean(input.contact, CONTACT_MAX);
  const contactType = oneOf<ContactType>(input.contactType, CONTACT_TYPES);

  if (!name) return { ok: false, error: 'name_required' };
  if (!contact) return { ok: false, error: 'contact_required' };
  if (!contactType) return { ok: false, error: 'contact_type_invalid' };

  // ── 2. 옵트인 플래그(불리언 강제) ──
  const wantInterview = input.wantInterview === true;
  const wantPrototype = input.wantPrototype === true;

  // ── 3. 부가 필드 정규화(허용 외 값은 null 화) ──
  const plan = oneOf<Plan>(input.plan, PLAN);
  const spotPref = oneOf<SpotPref>(input.spotPref, SPOT_PREF);
  const pain = oneOf<Pain>(input.pain, PAINS);

  const word = clean(input.word, FREE_TEXT_MAX);
  const travelType = clean(input.travelType, FREE_TEXT_MAX);
  const recRegion = clean(input.recRegion, FREE_TEXT_MAX);
  const recSpot = clean(input.recSpot, FREE_TEXT_MAX);
  const painText = clean(input.painText, FREE_TEXT_MAX);
  const source = clean(input.source, FREE_TEXT_MAX);

  // ── 4. 서버에서 신뢰 가능한 컨텍스트 보강(클라값 신뢰 X) ──
  const h = headers();
  const userAgent = h.get('user-agent')?.slice(0, FREE_TEXT_MAX) ?? null;
  const referrer = h.get('referer')?.slice(0, FREE_TEXT_MAX) ?? null;

  // ── 5. (best-effort) 라이트 throttle ──
  // serverless 는 무상태라 인메모리 카운터가 무의미하므로 DB 기반 best-effort.
  // 같은 session_id 가 최근 60초 내 다수 제출했으면 조용히 성공 처리(드롭).
  // service-role 가 없으면(local/env 미설정) 스킵 — 핵심 방어는 허니팟+검증.
  const sessionId = clean(input.sessionId, 80);
  if (sessionId) {
    try {
      const admin = getSupabaseAdminClient();
      if (admin) {
        const since = new Date(Date.now() - 60_000).toISOString();
        const { count } = await admin
          .from('join_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('source', sessionId)
          .gte('created_at', since);
        // NOTE: session_id 전용 컬럼이 없어 정밀 throttle 은 불가(스키마 최소화).
        //       위 비교는 source 가 session 으로 쓰일 때만 의미 있는 best-effort.
        //       남용이 보이면 Phase 후속에서 session_id 컬럼 추가를 검토.
        if (typeof count === 'number' && count >= 5) {
          return { ok: true }; // 과다 → 조용히 드롭(봇/연타 방어)
        }
      }
    } catch {
      /* throttle 실패는 무시 — 제출을 막지 않는다 */
    }
  }

  // ── 6. insert (anon 클라 → RLS anon-insert 정책 경유) ──
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    // env 미설정(local 등) → 저장 불가. 내부 사정 노출 없이 일반 에러.
    return { ok: false, error: 'storage_unavailable' };
  }

  const { error } = await supabase.from('join_submissions').insert({
    name,
    contact_type: contactType,
    contact,
    want_interview: wantInterview,
    want_prototype: wantPrototype,
    word,
    travel_type: travelType,
    plan,
    spot_pref: spotPref,
    rec_region: recRegion,
    rec_spot: recSpot,
    pain,
    pain_text: painText,
    source,
    user_agent: userAgent,
    referrer,
  });

  if (error) {
    // PII/스택/제약명 노출 금지 — 일반 코드만.
    console.error('[join] insert failed:', error.message);
    return { ok: false, error: 'submit_failed' };
  }

  // ── 7. 분석 훅: join_submit 1건 fire-and-forget(에러 swallow) ──
  // want_interview/want_prototype 는 events 에 boolean 슬롯이 없어 region 텍스트에 인코딩.
  // ⚠️ 마이그레이션(events CHECK 확장) 미적용 상태면 이 insert 는 거부되지만,
  //    아래 try/catch 가 swallow 하므로 제출 자체에는 무해하다.
  void recordJoinSubmitEvent(wantInterview, wantPrototype, sessionId, referrer);

  return { ok: true };
}

/** want_* 플래그를 events.region 슬롯에 인코딩해 join_submit 1건 기록(실패 무시). */
async function recordJoinSubmitEvent(
  wantInterview: boolean,
  wantPrototype: boolean,
  sessionId: string | null,
  referrer: string | null,
): Promise<void> {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;
    const region =
      wantInterview && wantPrototype
        ? 'both'
        : wantInterview
          ? 'interview'
          : wantPrototype
            ? 'prototype'
            : 'none';
    await supabase.from('events').insert({
      event_type: 'join_submit',
      region,
      session_id: sessionId,
      referrer,
    });
  } catch {
    /* 분석 실패는 절대 사용자 흐름을 막지 않는다 */
  }
}
