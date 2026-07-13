"use client";

/* ============================================================
 * K-Riders 스팟 어드민 — 등록/수정 공용 폼 (Phase 0 · 5단계).
 *   현장에서 폰으로 1분 안에 1건 등록이 목표 — 필수 6필드 최상단,
 *   선택 필드는 접힌 아코디언, 타이핑 대신 칩/토글 우선.
 *   검증은 lib/motorcycle/spots/validate.ts 단일 소스(선검증 + 서버 재검증).
 *   [결정 기록] status 칩은 폼에 두지 않는다 — 전환은 목록의 전용 버튼이
 *   담당하고, 폼은 기존 status(등록 시 DB 기본 draft)를 그대로 유지한다.
 * ============================================================ */

import { useId, useMemo, useState } from "react";
import type { Spot } from "@/lib/motorcycle/spots/types";
import {
  BEST_SEASON_MONTH_MAX,
  BEST_SEASON_MONTH_MIN,
  BEST_TIMES,
  CROWD_WEEKEND_LEVELS,
  PARKING_MOTO_LEVELS,
  RATING_PERSONAL_MAX,
  RATING_PERSONAL_MIN,
  ROAD_SURFACES,
  SPOT_CATEGORIES,
  SPOT_SOURCES,
  WINDING_GRADE_MAX,
  WINDING_GRADE_MIN,
} from "@/lib/motorcycle/spots/constants";
import { validateSpots, type ExistingSpotRef } from "@/lib/motorcycle/spots/validate";
import {
  emptySpotFormState,
  formStateToRaw,
  resizeImageToJpeg,
  spotPhotoUrl,
  spotToFormState,
  validationErrorText,
  type SpotFormState,
} from "./spotFormModel";

/* ── 상수(UI 편의 — 검증 기준 아님) ─────────────────────────── */

/** 자주 쓰는 시·도 제안 칩 — 값을 제한하지 않는 입력 보조. */
const REGION_SUGGESTIONS = ["대구", "경북", "경남", "부산", "울산", "강원", "충북", "전북"] as const;

const TRI_OPTIONS = [
  { value: "", label: "미입력" },
  { value: "true", label: "예" },
  { value: "false", label: "아니오" },
] as const;

const intRange = (min: number, max: number): string[] =>
  Array.from({ length: max - min + 1 }, (_, i) => String(min + i));

const WINDING_OPTIONS = intRange(WINDING_GRADE_MIN, WINDING_GRADE_MAX);
const RATING_OPTIONS = intRange(RATING_PERSONAL_MIN, RATING_PERSONAL_MAX);
const MONTHS = Array.from(
  { length: BEST_SEASON_MONTH_MAX - BEST_SEASON_MONTH_MIN + 1 },
  (_, i) => BEST_SEASON_MONTH_MIN + i
);

/* ── 공용 소품 ─────────────────────────────────────────────── */

function chipClass(selected: boolean): string {
  return `min-h-[40px] rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
    selected
      ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
      : "border-[var(--kr-line)] bg-[var(--kr-surface-1)] text-slate-400 hover:text-white"
  }`;
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={chipClass(selected)}>
      {children}
    </button>
  );
}

function ChipRow({
  label,
  options,
  value,
  onChange,
  allowClear = true,
  required = false,
  hint,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  allowClear?: boolean;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-amber-500" aria-hidden="true">
            *
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <ChipButton
            key={opt.value || "빈값"}
            selected={value === opt.value}
            onClick={() => onChange(value === opt.value && allowClear ? "" : opt.value)}
          >
            {opt.label}
          </ChipButton>
        ))}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  required = false,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric" | "url";
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-amber-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        /* 모바일 16px — iOS Safari 는 16px 미만 input 포커스 시 페이지를 강제 확대한다. */
        className="kr-input px-4 py-3 text-[16px] sm:text-sm"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-300">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="kr-input resize-none px-4 py-3 text-[16px] sm:text-sm"
      />
    </div>
  );
}

/** 접이식 섹션 — <details> 대신 상태 관리(리렌더 시 열림 상태 유지). */
function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="kr-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-white">{title}</span>
        <span
          aria-hidden="true"
          className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="space-y-5 border-t border-[var(--kr-line)] px-4 py-4">{children}</div>
      )}
    </section>
  );
}

/** 토글(verified 전용 — DB not null 이라 on/off 이분법이 안전). */
function ToggleRow({
  label,
  sub,
  on,
  onToggle,
}: {
  label: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="flex w-full items-center justify-between rounded-2xl border border-[var(--kr-line-strong)] bg-white/5 px-4 py-3.5 text-left"
    >
      <span>
        <span className="block text-sm font-bold text-white">{label}</span>
        <span className="block text-xs text-slate-400">{sub}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          on ? "bg-amber-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ── 본체 ──────────────────────────────────────────────────── */

interface SpotFormProps {
  mode: "create" | "edit";
  token: string;
  /** 교차 중복 검사용 — edit 모드에서는 자기 자신을 뺀 목록을 전달할 것. */
  existing: ExistingSpotRef[];
  /** edit 모드 초기값. */
  initial?: Spot;
  onSaved: (spot: Spot) => void;
  onUnauthorized: () => void;
}

export default function SpotForm({
  mode,
  token,
  existing,
  initial,
  onSaved,
  onUnauthorized,
}: SpotFormProps) {
  const uid = useId();
  const initialState = useMemo(
    () => (initial ? spotToFormState(initial) : emptySpotFormState()),
    [initial]
  );
  const [form, setForm] = useState<SpotFormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoNote, setGeoNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);

  const set = <K extends keyof SpotFormState>(key: K, value: SpotFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 수정 모드에서는 값이 이미 있는 섹션을 펼쳐서 보여준다(초기값 기준 1회 계산).
  const sectionDefaults = useMemo(() => {
    if (mode !== "edit") return { access: false, photo: false, timing: false, memo: false };
    const s = initialState;
    return {
      access: Boolean(
        s.address_road || s.region_sigungu || s.access_note || s.road_surface || s.parking_moto
      ),
      photo: Boolean(s.photos.length > 0 || s.photo_spot || s.photo_note),
      timing: Boolean(
        s.best_time.length > 0 ||
          s.best_season.length > 0 ||
          s.stay_minutes ||
          s.crowd_weekend ||
          s.winding_grade ||
          s.rating_personal ||
          s.senior_friendly ||
          s.verified
      ),
      memo: Boolean(s.alt_name || s.tags || s.source_url || s.memo || s.slug),
    };
  }, [mode, initialState]);

  /* ── 현재 위치 ── */

  const fillCurrentLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoNote({ text: "이 브라우저는 위치 기능을 지원하지 않습니다.", ok: false });
      return;
    }
    setGeoBusy(true);
    setGeoNote(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoBusy(false);
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setGeoNote({
          text: `현재 위치를 입력했어요 (정확도 ±${Math.round(pos.coords.accuracy)}m)`,
          ok: true,
        });
      },
      (err) => {
        setGeoBusy(false);
        setGeoNote({
          text:
            err.code === err.PERMISSION_DENIED
              ? "위치 권한이 거부됐어요 — 브라우저 설정에서 위치 권한을 허용해 주세요."
              : err.code === err.TIMEOUT
                ? "위치 조회 시간이 초과됐어요 — 하늘이 트인 곳에서 다시 시도해 주세요."
                : "위치를 가져오지 못했어요 — 잠시 후 다시 시도해 주세요.",
          ok: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* ── 사진 업로드 ── */

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading({ done: 0, total: files.length });
    setPhotoErrors([]);
    const okPaths: string[] = [];
    const errs: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const blob = await resizeImageToJpeg(file);
        const fd = new FormData();
        fd.append("file", blob, "photo.jpg");
        const res = await fetch("/api/admin/spots/photos", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd,
          cache: "no-store",
        });
        if (res.status === 401) {
          setUploading(null);
          onUnauthorized();
          return;
        }
        const j = (await res.json().catch(() => null)) as {
          paths?: string[];
          message?: string;
        } | null;
        if (!res.ok || !j?.paths || j.paths.length === 0) {
          errs.push(`'${file.name}': ${j?.message ?? "업로드에 실패했습니다."}`);
        } else {
          okPaths.push(...j.paths);
        }
      } catch {
        errs.push(`'${file.name}': 이미지 처리에 실패했습니다 (지원하지 않는 형식일 수 있어요).`);
      }
      setUploading({ done: i + 1, total: files.length });
    }

    if (okPaths.length > 0) {
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...okPaths] }));
    }
    setPhotoErrors(errs);
    setUploading(null);
  };

  const removePhoto = (path: string) => {
    // 기록에서만 제거 — 이미 업로드된 Storage 파일 정리는 Phase 1 스코프.
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p !== path) }));
  };

  /* ── 저장 ── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || uploading) return;

    const raw = formStateToRaw(form);
    // 선검증 — 서버와 같은 validateSpots 로 즉시 피드백.
    const pre = validateSpots([raw], existing);
    if (pre.errors.length > 0) {
      setErrors(pre.errors.map(validationErrorText));
      return;
    }

    setErrors([]);
    setSubmitting(true);
    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/spots" : `/api/admin/spots/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "x-admin-token": token, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
          cache: "no-store",
        }
      );
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      const j = (await res.json().catch(() => null)) as {
        spot?: Spot;
        message?: string;
        reasons?: string[];
      } | null;
      if (!res.ok || !j?.spot) {
        setErrors(
          j?.reasons && j.reasons.length > 0
            ? j.reasons
            : [j?.message ?? "저장에 실패했습니다. 잠시 후 다시 시도해 주세요."]
        );
        return;
      }
      if (mode === "create") {
        // 연속 입력 최적화 — 폼 전체 초기화(토스트는 부모가 표시).
        setForm(emptySpotFormState());
        setPhotoErrors([]);
        setGeoNote(null);
      }
      onSaved(j.spot);
    } catch {
      setErrors(["네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요."]);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 렌더 ── */

  const toggleBestTime = (t: string) =>
    set(
      "best_time",
      form.best_time.includes(t) ? form.best_time.filter((x) => x !== t) : [...form.best_time, t]
    );

  const toggleMonth = (m: number) =>
    set(
      "best_season",
      form.best_season.includes(m)
        ? form.best_season.filter((x) => x !== m)
        : [...form.best_season, m]
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── 필수 6필드 ── */}
      <div className="kr-card space-y-5 p-4">
        <p className="text-sm font-bold text-white">필수 정보</p>

        <TextField
          id={`${uid}-name`}
          label="이름"
          required
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="예: 언덕끝 로스터리"
        />

        <ChipRow
          label="카테고리"
          required
          options={opts(SPOT_CATEGORIES)}
          value={form.category}
          onChange={(v) => set("category", v)}
        />

        <ChipRow
          label="수집 출처"
          required
          options={opts(SPOT_SOURCES)}
          value={form.source}
          onChange={(v) => set("source", v)}
        />

        <div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              id={`${uid}-lat`}
              label="위도"
              required
              inputMode="decimal"
              value={form.lat}
              onChange={(v) => set("lat", v)}
              placeholder="35.9873"
            />
            <TextField
              id={`${uid}-lng`}
              label="경도"
              required
              inputMode="decimal"
              value={form.lng}
              onChange={(v) => set("lng", v)}
              placeholder="128.6841"
            />
          </div>
          <button
            type="button"
            onClick={fillCurrentLocation}
            disabled={geoBusy}
            className="kr-btn-secondary mt-3 min-h-[44px] w-full px-4 py-2.5 text-sm disabled:opacity-50"
          >
            {geoBusy ? "위치 확인 중…" : "📍 현재 위치 가져오기"}
          </button>
          {geoNote && (
            <p
              role="status"
              className={`mt-1.5 text-xs font-semibold ${geoNote.ok ? "text-amber-400" : "text-red-400"}`}
            >
              {geoNote.text}
            </p>
          )}
        </div>

        <div>
          <TextField
            id={`${uid}-region-sido`}
            label="지역 (시·도)"
            required
            value={form.region_sido}
            onChange={(v) => set("region_sido", v)}
            placeholder="예: 경북"
          />
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="자주 쓰는 지역">
            {REGION_SUGGESTIONS.map((r) => (
              <ChipButton
                key={r}
                selected={form.region_sido === r}
                onClick={() => set("region_sido", form.region_sido === r ? "" : r)}
              >
                {r}
              </ChipButton>
            ))}
          </div>
        </div>
      </div>

      {/* ── 선택: 접근·도로 ── */}
      <Section title="접근·도로" defaultOpen={sectionDefaults.access}>
        <TextField
          id={`${uid}-address-road`}
          label="도로명 주소"
          value={form.address_road}
          onChange={(v) => set("address_road", v)}
          placeholder="예: 대구 동구 팔공산로 1234"
        />
        <TextField
          id={`${uid}-region-sigungu`}
          label="시·군·구"
          value={form.region_sigungu}
          onChange={(v) => set("region_sigungu", v)}
          placeholder="예: 군위군"
        />
        <TextArea
          id={`${uid}-access-note`}
          label="접근 메모"
          value={form.access_note}
          onChange={(v) => set("access_note", v)}
          placeholder="예: 오르막 진입로 폭 좁음"
        />
        <ChipRow
          label="노면"
          options={opts(ROAD_SURFACES)}
          value={form.road_surface}
          onChange={(v) => set("road_surface", v)}
        />
        <ChipRow
          label="이륜차 주차"
          options={opts(PARKING_MOTO_LEVELS)}
          value={form.parking_moto}
          onChange={(v) => set("parking_moto", v)}
        />
      </Section>

      {/* ── 선택: 사진·촬영 ── */}
      <Section title="사진·촬영" defaultOpen={sectionDefaults.photo}>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-300">사진</p>
          {form.photos.length > 0 && (
            <ul className="mb-2 space-y-2">
              {form.photos.map((p) => {
                const url = spotPhotoUrl(p);
                return (
                  <li
                    key={p}
                    className="flex items-center gap-3 rounded-xl border border-[var(--kr-line)] p-2"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Storage 도메인이 next.config images 에 없고(기존 파일 수정 금지) 어드민 전용 썸네일이라 최적화 불필요
                      <img
                        src={url}
                        alt="업로드된 스팟 사진"
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/5 text-[10px] text-slate-500">
                        사진
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePhoto(p)}
                      className="kr-btn-danger min-h-[40px] shrink-0 px-3.5 text-xs"
                    >
                      제거
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <label className="kr-btn-secondary min-h-[44px] w-full cursor-pointer px-4 py-2.5 text-sm">
            {uploading
              ? `사진 업로드 중… (${uploading.done}/${uploading.total})`
              : "📷 사진 추가"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={!!uploading}
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                e.target.value = "";
                void handleFiles(files);
              }}
            />
          </label>
          {photoErrors.length > 0 && (
            <ul role="alert" className="mt-1.5 space-y-0.5 text-xs font-semibold text-red-400">
              {photoErrors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          <p className="mt-1.5 text-xs text-slate-500">
            긴 변 1600px JPEG 로 자동 리사이즈 후 업로드돼요. 실패한 사진만 제외되고 나머지는
            저장돼요.
          </p>
        </div>
        <ChipRow
          label="포토 스팟"
          options={TRI_OPTIONS}
          value={form.photo_spot}
          onChange={(v) => set("photo_spot", v)}
          allowClear={false}
        />
        <TextArea
          id={`${uid}-photo-note`}
          label="촬영 메모"
          value={form.photo_note}
          onChange={(v) => set("photo_note", v)}
          placeholder="예: 일몰 30분 전 도착 추천"
        />
      </Section>

      {/* ── 선택: 시기·평가 ── */}
      <Section title="시기·평가" defaultOpen={sectionDefaults.timing}>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-300">추천 시간대 (다중 선택)</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="추천 시간대">
            {BEST_TIMES.map((t) => (
              <ChipButton
                key={t}
                selected={form.best_time.includes(t)}
                onClick={() => toggleBestTime(t)}
              >
                {t}
              </ChipButton>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-300">추천 월 (다중 선택)</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="추천 월">
            {MONTHS.map((m) => (
              <ChipButton
                key={m}
                selected={form.best_season.includes(m)}
                onClick={() => toggleMonth(m)}
              >
                {m}월
              </ChipButton>
            ))}
          </div>
        </div>
        <TextField
          id={`${uid}-stay-minutes`}
          label="권장 체류 시간(분)"
          inputMode="numeric"
          value={form.stay_minutes}
          onChange={(v) => set("stay_minutes", v)}
          placeholder="예: 40"
        />
        <ChipRow
          label="주말 혼잡도"
          options={opts(CROWD_WEEKEND_LEVELS)}
          value={form.crowd_weekend}
          onChange={(v) => set("crowd_weekend", v)}
        />
        <ChipRow
          label="와인딩 재미 등급 (1~5)"
          options={opts(WINDING_OPTIONS)}
          value={form.winding_grade}
          onChange={(v) => set("winding_grade", v)}
          hint="인근 와인딩의 재미 등급이에요 — 속도 지표가 아니에요."
        />
        <ChipRow
          label="개인 평점 (1~5)"
          options={opts(RATING_OPTIONS)}
          value={form.rating_personal}
          onChange={(v) => set("rating_personal", v)}
        />
        <ChipRow
          label="초보·시니어 친화"
          options={TRI_OPTIONS}
          value={form.senior_friendly}
          onChange={(v) => set("senior_friendly", v)}
          allowClear={false}
        />
        <ToggleRow
          label="실방문 검증"
          sub="직접 방문해서 확인한 스팟이에요"
          on={form.verified}
          onToggle={() => set("verified", !form.verified)}
        />
      </Section>

      {/* ── 선택: 메모·출처 ── */}
      <Section title="메모·출처" defaultOpen={sectionDefaults.memo}>
        <TextField
          id={`${uid}-alt-name`}
          label="별칭"
          value={form.alt_name}
          onChange={(v) => set("alt_name", v)}
          placeholder="예: 언덕집"
        />
        <TextField
          id={`${uid}-tags`}
          label="태그"
          value={form.tags}
          onChange={(v) => set("tags", v)}
          placeholder="예: 뷰맛집; 테라스"
          hint="쉼표(,) 또는 세미콜론(;)으로 구분해요."
        />
        <TextField
          id={`${uid}-source-url`}
          label="출처 URL"
          inputMode="url"
          value={form.source_url}
          onChange={(v) => set("source_url", v)}
          placeholder="https://…"
        />
        <TextArea
          id={`${uid}-memo`}
          label="자유 메모"
          value={form.memo}
          onChange={(v) => set("memo", v)}
          placeholder="예: 낙엽 시즌 노면 주의"
          rows={3}
        />
        <TextField
          id={`${uid}-slug`}
          label="슬러그"
          value={form.slug}
          onChange={(v) => set("slug", v)}
          placeholder="예: 카페-언덕집-경북"
          hint="비워두면 이름+지역으로 자동 생성돼요."
        />
      </Section>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <p className="font-bold">저장할 수 없어요 — 아래 항목을 확인해 주세요.</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-xs">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !!uploading}
        className="kr-btn-primary w-full py-3.5 text-sm"
      >
        {submitting
          ? "저장 중…"
          : uploading
            ? "사진 업로드가 끝나면 저장할 수 있어요"
            : mode === "create"
              ? "스팟 등록"
              : "수정 저장"}
      </button>
    </form>
  );
}
