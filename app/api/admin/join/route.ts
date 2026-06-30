/* ============================================================
 * 동행단 초대(Join Companion) — 어드민 조회/삭제 API (창업자 전용).
 * 1) 공유 관리자 토큰(ADMIN_DASHBOARD_TOKEN)으로 게이트 — 로그인 불필요
 * 2) service_role 키로 join_submissions 조회/삭제 (RLS 우회, 서버에서만)
 * 토큰·서비스롤 키는 클라이언트로 절대 나가지 않는다. PII 포함 테이블이므로
 * 반드시 토큰 통과 후에만 데이터를 돌려준다(fail-closed).
 * ============================================================ */

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/data/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface JoinSubmissionRow {
  id: string;
  created_at: string;
  name: string;
  contact_type: string;
  contact: string;
  want_interview: boolean;
  want_prototype: boolean;
  word: string | null;
  travel_type: string | null;
  plan: string | null;
  spot_pref: string | null;
  rec_region: string | null;
  rec_spot: string | null;
  pain: string | null;
  pain_text: string | null;
  source: string | null;
  user_agent: string | null;
  referrer: string | null;
}

/** 토큰 게이트. 통과면 null, 막히면 에러 응답을 반환. */
function tokenGate(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!expected) {
    // Fail closed: 토큰 미설정이면 절대 데이터를 서빙하지 않는다.
    return NextResponse.json({ error: 'admin_token_not_configured' }, { status: 503 });
  }
  const token = request.headers.get('x-admin-token');
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const gate = tokenGate(request);
  if (gate) return gate;

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'service_role_key_missing' }, { status: 503 });
  }

  const { data, error } = await admin
    .from('join_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/join] select failed:', error.message);
    return NextResponse.json({ error: 'query_failed' }, { status: 500 });
  }

  const submissions = (data ?? []) as JoinSubmissionRow[];
  const stats = {
    total: submissions.length,
    wantInterview: submissions.filter((s) => s.want_interview).length,
    wantPrototype: submissions.filter((s) => s.want_prototype).length,
  };

  return NextResponse.json({
    submissions,
    stats,
    generatedAt: new Date().toISOString(),
  });
}

export async function DELETE(request: Request) {
  const gate = tokenGate(request);
  if (gate) return gate;

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'service_role_key_missing' }, { status: 503 });
  }

  let id: unknown;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    id = body.id;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (typeof id !== 'string' || id.length === 0) {
    return NextResponse.json({ error: 'id_required' }, { status: 400 });
  }

  const { error } = await admin.from('join_submissions').delete().eq('id', id);
  if (error) {
    console.error('[admin/join] delete failed:', error.message);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
