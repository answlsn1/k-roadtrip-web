/* K-Riders 스팟 CSV 임포트 CLI (Phase 0 · 6단계).
 *   사용법: npm run spots:import -- [파일경로] [--apply]
 *     파일경로 생략 시 data/spots-template.csv
 *     --apply 없으면 항상 dry-run(쓰기 없음)
 *
 *   [결정 기록]
 *   - 검증 로직: lib/motorcycle/spots/validate.ts 의 validateSpots 등을
 *     그대로 import — 재정의 금지 지시에 따름.
 *   - CSV 로드(BOM 제거·papaparse·한국어 파싱오류 매핑)는 4단계
 *     scripts/validate-spots.ts 와 동일 패턴이지만, 그 파일은 이 로직을
 *     export 하지 않고 main() 내부에 갇혀 있어 import 불가 — 여기서
 *     동일 패턴을 복제한다.
 *   - DB 행 변환(spotToRow)과 테이블명(SPOTS_TABLE)은 5단계
 *     app/api/admin/spots/_shared.ts 에서 import 해 재사용한다. 이 파일이
 *     "next/server"(NextResponse)를 최상단에서 import 하길래 Next.js 라우트
 *     문맥 밖(tsx 단독 실행)에서도 안전한지 먼저 실행 테스트로 확인했고
 *     — 문제없이 로드됨을 확인했다. 다만 tokenGate/badRequestBody 등
 *     HTTP 응답 전용 헬퍼와 fetchExistingRefs(비페이지네이션 + id 미포함,
 *     이 스크립트엔 upsert 대상 판별에 id 가 필요)는 이 스크립트 목적에
 *     맞지 않아 가져오지 않고, 기존 스팟 전체 조회는 4단계와 동일한
 *     id 정렬 페이지네이션으로 이 파일에서 직접 구현한다(전체 컬럼 필요 —
 *     "완전히 동일값" 스킵 판정에 name/lat/lng/slug 만으론 부족).
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline/promises";
import Papa from "papaparse";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  validateSpots,
  effectiveSlugOf,
  parseCsvSpotRow,
  SPOT_CSV_COLUMNS,
  SPOT_REQUIRED_FIELDS,
  type ExistingSpotRef,
  type ValidatedSpotRow,
  type SpotValidationError,
} from "../lib/motorcycle/spots/validate";
import type { Spot } from "../lib/motorcycle/spots/types";
import { SPOTS_TABLE, spotToRow } from "../app/api/admin/spots/_shared";

const DEFAULT_CSV = "data/spots-template.csv";
const PAGE = 1000;

type WriteRow = ReturnType<typeof spotToRow>;

type RowKind = "insert" | "update" | "skip";

interface ClassifiedRow {
  row: ValidatedSpotRow;
  kind: RowKind;
  existingId?: string;
  existingSpot?: Spot;
  changedFields?: string[];
}

/* ── 인자 파싱 ─────────────────────────────────────────────── */

function parseArgs(argv: string[]): { target: string; apply: boolean } {
  const apply = argv.includes("--apply");
  const positional = argv.filter((a) => a !== "--apply");
  return { target: positional[0] ?? DEFAULT_CSV, apply };
}

/* ── env 필수 체크 ─────────────────────────────────────────── */

function requireEnvOrExit(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "FAIL - 환경변수가 설정되지 않았습니다: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
    console.error(
      "  이 스크립트는 실제 DB 조회·쓰기가 필수라 두 값 없이는 아무 것도 할 수 없습니다."
    );
    console.error(
      "  .env.local 은 자동 로드되지 않습니다 — 실행 전 셸에서 직접 설정하세요."
    );
    console.error(
      '  예(PowerShell): $env:NEXT_PUBLIC_SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npm run spots:import -- ...'
    );
    process.exit(1);
  }
  return { url, key };
}

/* ── 기존 스팟 전체 조회(전 컬럼, id 정렬 페이지네이션) ───────── */

async function fetchExistingSpotsFull(
  url: string,
  key: string
): Promise<{ client: SupabaseClient; existing: Spot[] }> {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const all: Spot[] = [];
  for (let from = 0; ; from += PAGE) {
    // order 없이 range 만 쓰면 Postgres 가 페이지 간 순서를 보장하지 않아
    // 1000건 초과 시 행이 누락/중복될 수 있다 — id 정렬로 고정(4단계와 동일).
    const { data, error } = await client
      .from(SPOTS_TABLE)
      .select("*")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`motorcycle_spots 조회 실패: ${error.message}`);
    const page = (data ?? []) as Spot[];
    all.push(...page);
    if (page.length < PAGE) break;
  }
  return { client, existing: all };
}

/* ── CSV 로드(4단계와 동일 패턴 복제) ──────────────────────── */

const PAPA_ERROR_KO: Record<string, string> = {
  TooManyFields: "컬럼 수가 헤더보다 많습니다 — 셀 안에 쉼표가 있으면 따옴표로 감싸주세요",
  TooFewFields: "컬럼 수가 헤더보다 적습니다 — 중간에 빠진 셀이 없는지 확인하세요",
  UndetectableDelimiter: "구분자를 인식할 수 없습니다 — 쉼표(,) 구분 CSV 인지 확인하세요",
  MissingQuotes: "닫히지 않은 따옴표가 있습니다",
  InvalidQuotes: "따옴표 처리가 잘못됐습니다",
};

function loadCsvOrExit(target: string): {
  rawRows: Record<string, string>[];
  parseFailures: string[];
  parseErrorRows: Set<number>;
} {
  const filePath = resolve(process.cwd(), target);
  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    console.error(`FAIL - 파일을 읽을 수 없습니다: ${filePath}`);
    process.exit(1);
  }
  // BOM(U+FEFF) 제거 — 엑셀 호환용으로 템플릿에 포함돼 있음
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  const parseFailures: string[] = [];
  const parseErrorRows = new Set<number>();
  for (const err of parsed.errors) {
    const humanRow = typeof err.row === "number" ? err.row + 2 : null;
    if (humanRow !== null) parseErrorRows.add(humanRow);
    const ko = PAPA_ERROR_KO[err.code] ?? err.message;
    parseFailures.push(`${humanRow !== null ? `${humanRow}행 ` : ""}CSV 파싱 오류: ${ko}`);
  }

  const fields = parsed.meta.fields ?? [];
  const missingRequired = SPOT_REQUIRED_FIELDS.filter((c) => !fields.includes(c));
  if (missingRequired.length > 0) {
    console.error(
      `FAIL - 필수 컬럼 누락: ${missingRequired.join(", ")} — data/spots-template.csv 헤더를 그대로 사용하세요`
    );
    process.exit(1);
  }
  const unknownCols = fields.filter((f) => !(SPOT_CSV_COLUMNS as readonly string[]).includes(f));
  if (unknownCols.length > 0) {
    console.log(`주의 - 알 수 없는 컬럼(무시됨): ${unknownCols.join(", ")}`);
  }
  const missingOptional = SPOT_CSV_COLUMNS.filter((c) => !fields.includes(c));
  if (missingOptional.length > 0) {
    console.log(`주의 - 템플릿 대비 빠진 컬럼(빈 값으로 처리): ${missingOptional.join(", ")}`);
  }

  return { rawRows: parsed.data, parseFailures, parseErrorRows };
}

/* ── 교차 중복 검사에서 "자기 자신" 제외 ──────────────────────
 * CSV 의 각 행이 매칭시킬 slug(effectiveSlugOf)를 미리 계산해, existing 중
 * 그 slug 와 일치하는 항목만 교차 중복 검사에서 뺀다 — 이미 DB 에 있는
 * 스팟을 "갱신"하려는 정상 케이스와, 진짜 새로운 스팟이 이름/좌표/slug 가
 * 겹치는 비정상 케이스(진짜 중복)를 구분하기 위함이다. 이걸 안 하면 재수입
 * (이미 등록된 CSV 를 나중에 다시 돌리는 흔한 워크플로우) 자체가 매번
 * "기존 스팟과 중복"으로 막혀버린다(어드민 PATCH 라우트의
 * fetchExistingRefs(excludeId) 자기제외 패턴과 동일한 목적). */
function excludeSelfMatches(
  rawRows: Record<string, string>[],
  existingRefs: ExistingSpotRef[]
): ExistingSpotRef[] {
  const incomingSlugs = new Set<string>();
  for (const raw of rawRows) {
    const { candidate } = parseCsvSpotRow(raw);
    const slug = effectiveSlugOf(candidate);
    if (slug) incomingSlugs.add(slug);
  }
  return existingRefs.filter((e) => !e.slug || !incomingSlugs.has(e.slug));
}

/* ── 신규/갱신/스킵 분류 ───────────────────────────────────── */

/** CSV 가 비워둔(=undefined) 외부관리 필드는 기존 DB 값을 그대로 유지한다.
 * spotToRow 는 어드민 PATCH 폼처럼 "항상 전체 상태를 보낸다"는 전제로
 * undefined 를 false/'draft'/null 기본값으로 채우는데(_shared.ts 주석 참고),
 * CSV 워크플로우엔 그 전제가 없다 — verified/status/photos 는 통상 현장
 * 재방문 검증이나 어드민 폼 업로드로만 채워지고 마스터 시트/CSV 는 비워두는
 * 게 관례(가이드 문서)라, 그대로 두면 재수입만으로 이미 검증·공개하고
 * 사진을 붙여둔 스팟이 조용히 draft/미검증/사진삭제 상태로 되돌아간다. */
function resolveWriteRow(spot: ValidatedSpotRow["spot"], existingSpot?: Spot): WriteRow {
  const row = spotToRow(spot);
  if (existingSpot) {
    if (spot.photos === undefined) row.photos = existingSpot.photos;
    if (spot.verified === undefined) row.verified = existingSpot.verified;
    if (spot.status === undefined) row.status = existingSpot.status;
  }
  return row;
}

/** newRow 의 모든 필드를 existing 의 동일 필드와 비교 — 완전 일치면 true. */
function rowsEqual(newRow: WriteRow, existing: Spot): boolean {
  for (const key of Object.keys(newRow) as (keyof WriteRow)[]) {
    const a = JSON.stringify(newRow[key] ?? null);
    const b = JSON.stringify((existing as unknown as Record<string, unknown>)[key] ?? null);
    if (a !== b) return false;
  }
  return true;
}

function diffFields(newRow: WriteRow, existing: Spot): string[] {
  const diffs: string[] = [];
  for (const key of Object.keys(newRow) as (keyof WriteRow)[]) {
    const a = JSON.stringify(newRow[key] ?? null);
    const b = JSON.stringify((existing as unknown as Record<string, unknown>)[key] ?? null);
    if (a !== b) diffs.push(key as string);
  }
  return diffs;
}

function classifyRows(valid: ValidatedSpotRow[], existing: Spot[]): ClassifiedRow[] {
  const existingBySlug = new Map<string, Spot>();
  for (const e of existing) {
    if (e.slug) existingBySlug.set(e.slug, e);
  }
  return valid.map((v) => {
    const found = existingBySlug.get(v.spot.slug);
    if (!found) return { row: v, kind: "insert" };
    const newRow = resolveWriteRow(v.spot, found);
    if (rowsEqual(newRow, found)) {
      return { row: v, kind: "skip", existingId: found.id, existingSpot: found };
    }
    return {
      row: v,
      kind: "update",
      existingId: found.id,
      existingSpot: found,
      changedFields: diffFields(newRow, found),
    };
  });
}

const KIND_LABEL: Record<RowKind, string> = { insert: "신규", update: "갱신", skip: "스킵" };

function printClassification(classified: ClassifiedRow[]): {
  insert: number;
  update: number;
  skip: number;
} {
  for (const c of classified) {
    const label = KIND_LABEL[c.kind];
    const detail =
      c.kind === "insert"
        ? "새 스팟으로 등록됩니다"
        : c.kind === "update"
          ? `기존 스팟과 값이 달라 갱신됩니다 (변경 필드: ${(c.changedFields ?? []).join(", ")})`
          : "기존 스팟과 완전히 동일 — 변경 사항 없음";
    console.log(
      `  ${label} - ${c.row.row}행 ${c.row.spot.name} (slug: ${c.row.spot.slug}) — ${detail}`
    );
  }
  const counts = { insert: 0, update: 0, skip: 0 };
  for (const c of classified) counts[c.kind]++;
  return counts;
}

/* ── main ──────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const { target, apply } = parseArgs(process.argv.slice(2));
  console.log(`[K-Riders 스팟 임포트] 대상: ${target} (${apply ? "APPLY" : "DRY RUN"})`);

  // DB 연결 필수 — service role 없이는 조회도 쓰기도 불가.
  const { url, key } = requireEnvOrExit();

  const { rawRows, parseFailures, parseErrorRows } = loadCsvOrExit(target);
  console.log(`데이터 ${rawRows.length}행 로드 (행 번호는 헤더=1행, 데이터=2행부터)`);

  let existing: Spot[];
  let client: SupabaseClient;
  try {
    const fetched = await fetchExistingSpotsFull(url, key);
    existing = fetched.existing;
    client = fetched.client;
    console.log(`DB 조회: 기존 motorcycle_spots ${existing.length}건`);
  } catch (e) {
    console.error(`FAIL - DB 조회 실패: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  const existingRefs: ExistingSpotRef[] = existing.map((e) => ({
    name: e.name,
    lat: e.lat,
    lng: e.lng,
    slug: e.slug,
  }));
  // CSV 가 갱신하려는 기존 스팟(자기 자신)은 교차 중복 검사에서 제외 —
  // 안 하면 재수입할 때마다 "기존 스팟과 중복"으로 매번 막힌다.
  const crossDupRefs = excludeSelfMatches(rawRows, existingRefs);

  const result = validateSpots(rawRows, crossDupRefs);

  const failures: string[] = [...parseFailures];
  const sortedErrors = [...result.errors].sort(
    (a: SpotValidationError, b: SpotValidationError) => a.row - b.row
  );
  for (const e of sortedErrors) {
    failures.push(`${e.row}행${e.field ? ` [${e.field}]` : ""} ${e.reason}`);
  }

  // 검증 실패 행이 하나라도 있으면 즉시 중단 — 부분 성공(통과분만 쓰기) 금지.
  if (failures.length > 0 || parseErrorRows.size > 0) {
    console.log("\n[검증 실패 목록]");
    for (const f of failures) console.error(`  FAIL - ${f}`);
    console.log(
      `\n${failures.length}건 검증 실패, 임포트 중단. npm run spots:validate 로 먼저 고치세요`
    );
    process.exit(1);
  }

  // validateSpots 는 CSV 파싱 오류가 없을 때만 유효 행을 전부 승격시킨다 —
  // 위에서 parseErrorRows/failures 가 모두 0건임을 이미 확인했으므로
  // result.valid 가 곧 rawRows 전체에 대응한다.
  console.log(`검증 통과 ${result.valid.length}건 — 신규/갱신/스킵 분류 중`);

  const classified = classifyRows(result.valid, existing);

  console.log("\n[분류 결과]");
  const counts = printClassification(classified);
  console.log(`\n신규 ${counts.insert}건 / 갱신 ${counts.update}건 / 스킵 ${counts.skip}건`);

  if (!apply) {
    console.log("\nDRY RUN — 실제로 DB에 쓰지 않았습니다. --apply 를 붙이면 반영됩니다.");
    process.exit(0);
  }

  console.log(
    `\n실제 프로덕션 DB 에 저장합니다 — 신규 ${counts.insert}건 / 갱신 ${counts.update}건 / 스킵 ${counts.skip}건`
  );
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('계속하려면 "apply" 를 입력하세요 (그 외 입력은 취소): ');
  rl.close();
  if (answer.trim() !== "apply") {
    console.log("취소했습니다 — DB 에 아무것도 쓰지 않았습니다.");
    process.exit(0);
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const writeFailures: string[] = [];

  for (const c of classified) {
    if (c.kind === "skip") {
      skipped++;
      continue;
    }
    // update 는 기존 스팟(existingSpot)을 넘겨 verified/status/photos 같은
    // 외부관리 필드를 보존한다(insert 는 existingSpot 없음 = 그대로 spotToRow).
    const row = resolveWriteRow(c.row.spot, c.existingSpot);
    if (c.kind === "insert") {
      const { error } = await client.from(SPOTS_TABLE).insert(row);
      if (error) {
        writeFailures.push(`${c.row.row}행 ${c.row.spot.name} 등록 실패: ${error.message}`);
        continue;
      }
      inserted++;
    } else {
      const { error } = await client.from(SPOTS_TABLE).update(row).eq("id", c.existingId as string);
      if (error) {
        writeFailures.push(`${c.row.row}행 ${c.row.spot.name} 갱신 실패: ${error.message}`);
        continue;
      }
      updated++;
    }
  }

  console.log("\n[저장 결과]");
  console.log(`  신규 등록 ${inserted}건 / 갱신 ${updated}건 / 스킵 ${skipped}건 / 실패 ${writeFailures.length}건`);
  if (writeFailures.length > 0) {
    console.log("\n[실패 목록]");
    for (const f of writeFailures) console.error(`  FAIL - ${f}`);
    console.log(
      `\n주의: 이 실행에 트랜잭션이 없어 신규 ${inserted}건/갱신 ${updated}건은 이미 DB 에 반영됐습니다 — ` +
        "실패한 행만 CSV 에서 고쳐 다시 실행하세요(성공한 행은 다음 실행에서 '스킵'으로 잡혀 안전합니다)."
    );
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(`FAIL - 예기치 못한 오류: ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`);
  process.exit(1);
});
