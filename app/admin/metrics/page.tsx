"use client";

import { useEffect, useState } from "react";

interface Metrics {
  coverage: { regions: number; routes: number; places: number };
  foreign: {
    totalSessions: number;
    knownCountry: number;
    foreignByCountry: number;
    foreignByLocale: number;
  };
  dispersion: { regionCounts: Record<string, number>; metro: number; rural: number };
  funnel: { step: string; count: number; fromPrev: number | null }[];
  totalEvents: number;
  generatedAt: string;
}

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

const FUNNEL_LABEL: Record<string, string> = {
  region_view: "지역 발견",
  route_view: "코스 조회",
  plan_created: "플랜 생성",
  naver_handoff: "원탭 길안내 (기능)",
  affiliate_click: "예약 클릭",
};

function pct(n: number, d: number): string {
  return d > 0 ? `${((n / d) * 100).toFixed(0)}%` : "—";
}

export default function AdminMetricsPage() {
  const [view, setView] = useState<View>("locked");
  const [data, setData] = useState<Metrics | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [detail, setDetail] = useState<string | null>(null);

  const load = async (token: string) => {
    setView("loading");
    setDetail(null);
    try {
      const res = await fetch("/api/admin/metrics", {
        headers: { "x-admin-token": token },
        cache: "no-store",
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        setDetail("토큰이 올바르지 않습니다. 다시 입력해 주세요.");
        setView("locked");
        return;
      }
      if (res.status === 503) {
        const j = await res.json().catch(() => ({}));
        setDetail(
          j.error === "service_role_key_missing"
            ? "서버에 SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
            : "서버에 ADMIN_DASHBOARD_TOKEN 이 설정되지 않았습니다 (Vercel 환경변수 + 재배포)."
        );
        setView("unconfigured");
        return;
      }
      if (!res.ok) {
        setView("error");
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      setData((await res.json()) as Metrics);
      setView("ready");
    } catch {
      setView("error");
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) load(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tokenInput.trim();
    if (t) load(t);
  };

  const lock = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setTokenInput("");
    setData(null);
    setDetail(null);
    setView("locked");
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl bg-white px-5 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            K-RoadTrip · 비공개
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">지역 가치 증거 대시보드</h1>
        </div>
        {view === "ready" && (
          <button onClick={lock} className="text-xs font-semibold text-slate-400 hover:text-slate-700">
            잠그기
          </button>
        )}
      </div>

      {(view === "locked" || view === "unconfigured" || view === "error") && (
        <Card className="mt-10">
          {view === "unconfigured" ? (
            <>
              <p className="font-bold text-slate-800">설정이 필요합니다</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{detail}</p>
            </>
          ) : view === "error" ? (
            <p className="font-bold text-slate-800">데이터를 불러오지 못했습니다</p>
          ) : (
            <>
              <p className="font-bold text-slate-800">관리자 토큰 입력</p>
              <p className="mt-1 text-sm text-slate-500">창업자 전용 대시보드입니다.</p>
              <form onSubmit={submit} className="mt-4 flex gap-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ADMIN_DASHBOARD_TOKEN"
                  autoFocus
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white active:scale-[0.99]"
                >
                  열기
                </button>
              </form>
              {detail && <p className="mt-2 text-xs font-semibold text-rose-500">{detail}</p>}
            </>
          )}
        </Card>
      )}

      {view === "loading" && (
        <p className="mt-16 text-center text-sm text-slate-400">불러오는 중…</p>
      )}

      {view === "ready" && data && (
        <div className="mt-8 space-y-8">
          <p className="text-xs text-slate-400">
            누적 이벤트 {data.totalEvents.toLocaleString()}건 · 갱신{" "}
            {new Date(data.generatedAt).toLocaleString("ko-KR")}
          </p>

          {/* ① 지역 커버리지 */}
          <Section title="① 지역 커버리지 (실데이터)">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="지역" value={data.coverage.regions} />
              <Stat label="코스" value={data.coverage.routes} />
              <Stat label="장소" value={data.coverage.places} />
            </div>
          </Section>

          {/* ② 외국인 유입 */}
          <Section title="② 외국인 유입 (세션 집계)">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="전체 세션" value={data.foreign.totalSessions} />
              <Stat
                label="외국 로케일"
                value={data.foreign.foreignByLocale}
                sub={pct(data.foreign.foreignByLocale, data.foreign.totalSessions)}
              />
              <Stat label="국가 식별 세션" value={data.foreign.knownCountry} />
              <Stat
                label="비한국 국가"
                value={data.foreign.foreignByCountry}
                sub={pct(data.foreign.foreignByCountry, data.foreign.knownCountry)}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              국가코드는 프로덕션(Vercel)에서만 채워집니다. 로케일 기준은 어디서나 집계됩니다.
            </p>
          </Section>

          {/* ③ 지방 분산 */}
          <Section title="③ 지방 분산 (수도권 vs 지방)">
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Stat label="지방 반응" value={data.dispersion.rural} />
              <Stat label="수도권 반응" value={data.dispersion.metro} />
            </div>
            <Bars
              rows={Object.entries(data.dispersion.regionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => ({ label: k, value: v }))}
            />
          </Section>

          {/* ④ 수익 funnel — 발견 → 기획 → 예약 */}
          <Section title="④ 핵심 전환: 발견 → 기획 → 예약 (외화 경로)">
            {(() => {
              const c = (s: string) => data.funnel.find((f) => f.step === s)?.count ?? 0;
              const discovery = c("region_view") + c("route_view");
              const planning = c("plan_created");
              const booking = c("affiliate_click");
              return (
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <Stat label="발견 (조회)" value={discovery} />
                  <Stat label="기획 (플랜)" value={planning} sub={pct(planning, discovery)} />
                  <Stat label="예약 (제휴 클릭)" value={booking} sub={pct(booking, planning)} />
                </div>
              );
            })()}
            <p className="mb-3 text-[11px] text-slate-400">
              핵심 가치는 <b>발견 → 기획 → 예약</b> 전환입니다. 원탭 길안내(핸드오프)는
              보조 기능 지표로 아래에 표시합니다.
            </p>
            <div className="space-y-2">
              {data.funnel.map((f) => {
                const top = data.funnel[0].count || 1;
                return (
                  <div key={f.step} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs font-semibold text-slate-600">
                      {FUNNEL_LABEL[f.step] ?? f.step}
                    </span>
                    <div className="h-6 flex-1 overflow-hidden rounded-md bg-slate-100">
                      <div
                        className="flex h-full items-center justify-end rounded-md bg-emerald-500 px-2 text-[11px] font-bold text-white"
                        style={{ width: `${Math.max((f.count / top) * 100, f.count > 0 ? 8 : 0)}%` }}
                      >
                        {f.count > 0 ? f.count : ""}
                      </div>
                    </div>
                    <span className="w-12 shrink-0 text-right text-[11px] text-slate-400">
                      {f.fromPrev == null ? "" : `${(f.fromPrev * 100).toFixed(0)}%`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">우측 %는 직전 단계 대비 전환율입니다.</p>
          </Section>
        </div>
      )}
    </main>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-slate-50 p-8 ${className}`}>{children}</div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 p-6">
      <h2 className="mb-4 text-sm font-extrabold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
      <p className="text-2xl font-extrabold text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{label}</p>
      {sub && <p className="text-[11px] font-bold text-emerald-600">{sub}</p>}
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) {
    return <p className="text-xs text-slate-400">아직 데이터가 없습니다 (런칭 후 누적).</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs font-semibold text-slate-600">{r.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <div className="h-full rounded bg-sky-500" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right text-[11px] text-slate-400">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
