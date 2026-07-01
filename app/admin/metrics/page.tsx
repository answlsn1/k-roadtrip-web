"use client";

import { useEffect, useState } from "react";

interface Metrics {
  coverage: { regions: number; routes: number; places: number };
  foreign: {
    totalSessions: number;
    knownCountry: number;
    foreignByCountry: number;
    foreignByLocale: number;
    countryBreakdown: { country: string; count: number }[];
  };
  dispersion: {
    regionCounts: Record<string, number>;
    foreignRegionCounts: Record<string, number>;
    metro: number;
    rural: number;
    foreignMetro: number;
    foreignRural: number;
  };
  funnel: { step: string; count: number; fromPrev: number | null }[];
  totalEvents: number;
  generatedAt: string;
}

type View = "locked" | "loading" | "ready" | "error" | "unconfigured";

const TOKEN_KEY = "krt-admin-token";

const FUNNEL_LABEL: Record<string, string> = {
  region_view: "여행지 둘러보기",
  route_view: "코스 자세히 보기",
  plan_created: "일정 만들기",
  naver_handoff: "길찾기 연결 (참고 지표)",
  affiliate_click: "예약 링크 클릭",
};

// 주요 유입국 코드 → 국기·한글명. 못 찾으면 코드 그대로 보여준다.
const COUNTRY_LABEL: Record<string, string> = {
  US: "🇺🇸 미국",
  JP: "🇯🇵 일본",
  CN: "🇨🇳 중국",
  TW: "🇹🇼 대만",
  HK: "🇭🇰 홍콩",
  SG: "🇸🇬 싱가포르",
  GB: "🇬🇧 영국",
  DE: "🇩🇪 독일",
  FR: "🇫🇷 프랑스",
  AU: "🇦🇺 호주",
  CA: "🇨🇦 캐나다",
  TH: "🇹🇭 태국",
  VN: "🇻🇳 베트남",
  PH: "🇵🇭 필리핀",
  ID: "🇮🇩 인도네시아",
  IN: "🇮🇳 인도",
  MY: "🇲🇾 말레이시아",
  NL: "🇳🇱 네덜란드",
  KR: "🇰🇷 한국",
};

function countryLabel(code: string): string {
  return COUNTRY_LABEL[code] ?? code;
}

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
          <h1 className="text-2xl font-extrabold text-slate-900">외국인 여행 수요 대시보드</h1>
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

          {data.foreign.totalSessions < 30 && (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
              ⚠️ 아직 방문자 수가 적어요 (총 {data.foreign.totalSessions}명). 방문자가 더 쌓이기
              전까지는 아래 숫자·비율을 확정된 결론이 아니라 &quot;대략적인 흐름&quot;
              참고용으로만 봐주세요.
            </div>
          )}

          {/* ① 우리가 다루는 여행지 */}
          <Section title="① 우리가 다루는 여행지">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="지역" value={data.coverage.regions} />
              <Stat label="코스" value={data.coverage.routes} />
              <Stat label="장소" value={data.coverage.places} />
            </div>
          </Section>

          {/* ② 외국인이 실제로 오고 있나 */}
          <Section title="② 외국인이 실제로 오고 있나?">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="전체 방문자" value={data.foreign.totalSessions} />
              <Stat
                label="외국어 사용 방문자"
                value={data.foreign.foreignByLocale}
                sub={pct(data.foreign.foreignByLocale, data.foreign.totalSessions)}
              />
              <Stat label="위치 확인된 방문자" value={data.foreign.knownCountry} />
              <Stat
                label="해외 접속 방문자"
                value={data.foreign.foreignByCountry}
                sub={pct(data.foreign.foreignByCountry, data.foreign.knownCountry)}
              />
            </div>

            <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
              <p>
                <b className="text-slate-600">외국어 사용 방문자</b> — 휴대폰·브라우저 언어가
                한국어가 아닌 방문자예요. 배포 전에도 확인할 수 있지만, 영어 폰을 쓰는 한국인도
                섞여 정확도는 낮아요.
              </p>
              <p>
                <b className="text-slate-600">해외 접속 방문자</b> — 실제 접속 위치(IP)로 확인한
                국가가 한국이 아닌 경우예요. 더 정확하지만, 실제 배포된 사이트에서만 확인돼요.
              </p>
            </div>

            {data.foreign.countryBreakdown.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  어느 나라에서 왔나 (위치 확인된 방문자 기준)
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.foreign.countryBreakdown.map((c) => (
                    <span
                      key={c.country}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {countryLabel(c.country)} {c.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ③ 외국인은 어떤 지역에 관심 있나 */}
          <Section title="③ 외국인은 어떤 지역에 관심 있나?">
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Stat label="지방 코스 조회 (외국인)" value={data.dispersion.foreignRural} />
              <Stat label="수도권 코스 조회 (외국인)" value={data.dispersion.foreignMetro} />
            </div>
            <RegionTable
              all={data.dispersion.regionCounts}
              foreign={data.dispersion.foreignRegionCounts}
            />
            <p className="mt-2 text-[11px] text-slate-400">
              &quot;외국인&quot; 열은 외국어 사용 방문자만 센 것이라, 전체 조회수보다 항상
              작거나 같아요.
            </p>
          </Section>

          {/* ④ 관심이 실제 예약으로 이어지나 */}
          <Section title="④ 관심이 실제 예약으로 이어지나?">
            {(() => {
              const c = (s: string) => data.funnel.find((f) => f.step === s)?.count ?? 0;
              const discovery = c("region_view") + c("route_view");
              const planning = c("plan_created");
              const booking = c("affiliate_click");
              return (
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <Stat label="둘러보기" value={discovery} />
                  <Stat label="일정 만들기" value={planning} sub={pct(planning, discovery)} />
                  <Stat label="예약 링크 클릭" value={booking} sub={pct(booking, planning)} />
                </div>
              );
            })()}
            <p className="mb-3 text-[11px] text-slate-400">
              가장 중요하게 보는 흐름은 <b>둘러보기 → 일정 만들기 → 예약</b>이에요. 길찾기
              연결은 예약과 직접 관련은 없지만, 실제로 여행에 썼는지 보여주는 참고 지표로
              아래에 함께 표시해요.
            </p>
            <div className="space-y-2">
              {data.funnel.map((f) => {
                const top = data.funnel[0].count || 1;
                return (
                  <div key={f.step} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-xs font-semibold text-slate-600">
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
            <p className="mt-2 text-[11px] text-slate-400">
              오른쪽 %는 바로 위 단계 대비 비율이에요. 참고: 방문자가 항상 이 순서대로만
              움직이는 건 아니에요 — 코스만 보고 바로 길찾기를 누르는 경우도 있어서, 100%를
              넘을 수도 있어요.
            </p>
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

/** 지역별 "전체 조회 vs 외국인 조회"를 나란히 보여주는 표 — 외국인 조회 많은 순 정렬. */
function RegionTable({
  all,
  foreign,
}: {
  all: Record<string, number>;
  foreign: Record<string, number>;
}) {
  const regions = Object.keys(all);
  if (regions.length === 0) {
    return <p className="text-xs text-slate-400">아직 데이터가 없습니다 (런칭 후 누적).</p>;
  }
  const rows = regions
    .map((region) => ({ region, all: all[region] ?? 0, foreign: foreign[region] ?? 0 }))
    .sort((a, b) => b.foreign - a.foreign || b.all - a.all);
  const maxAll = Math.max(...rows.map((r) => r.all), 1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 px-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="w-24 shrink-0">지역</span>
        <span className="flex-1">전체 조회</span>
        <span className="w-16 shrink-0 text-right">외국인</span>
      </div>
      {rows.map((r) => (
        <div key={r.region} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs font-semibold text-slate-600">
            {r.region}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
            <div
              className="h-full rounded bg-sky-500"
              style={{ width: `${(r.all / maxAll) * 100}%` }}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-xs font-bold text-emerald-600">
            {r.foreign > 0 ? r.foreign : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
