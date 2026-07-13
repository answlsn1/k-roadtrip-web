/* ============================================================
 * K-Riders 스팟 DB — 어드민 사진 업로드 API (Phase 0 · 5단계).
 *   POST: 토큰 게이트 → FormData(file 다중)를 spot-photos 버킷에 업로드.
 *   버킷에 쓰기 정책이 없으므로(0010 마이그레이션) service role 로만
 *   업로드 가능 — 반드시 이 서버 코드를 거친다.
 *   경로는 `${Date.now()}-${난수8}.jpg` — 충돌 없는 이름.
 *   파일당 상한 5MB(클라이언트 리사이즈 후 기준) 초과 시 400.
 * ============================================================ */

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/data/supabaseAdmin";
import { SPOT_PHOTOS_BUCKET, serviceRoleMissingResponse, tokenGate } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 파일당 상한 — 클라이언트 리사이즈(긴 변 1600px JPEG) 후 기준 5MB. */
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** 허용 이미지 타입 — 공개 버킷이라 안전목록으로 강제한다.
 *  image/* prefix 검사는 image/svg+xml(스크립트 실행 가능한 stored XSS 벡터)을
 *  통과시키고, 빈 타입은 검사를 건너뛰게 되므로 둘 다 차단. 클라이언트는 항상
 *  canvas 인코딩 image/jpeg 를 보내므로 정상 경로는 영향 없음. */
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const gate = tokenGate(request);
  if (gate) return gate;

  const admin = getSupabaseAdminClient();
  if (!admin) return serviceRoleMissingResponse();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "multipart/form-data 형식이 아닙니다." },
      { status: 400 }
    );
  }

  const files = form.getAll("file").filter((v): v is File => typeof v !== "string");
  if (files.length === 0) {
    return NextResponse.json(
      { error: "no_files", message: "업로드할 파일이 없습니다 (form-data 'file' 필드)." },
      { status: 400 }
    );
  }

  // 업로드 시작 전에 전 파일 선검사 — 일부만 올라간 채 400 나는 상황 방지.
  for (const file of files) {
    if (file.size === 0) {
      return NextResponse.json(
        { error: "empty_file", message: `'${file.name}' 이(가) 빈 파일입니다.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return NextResponse.json(
        {
          error: "file_too_large",
          message: `'${file.name}' 이(가) 5MB 를 초과합니다 (${mb}MB) — 리사이즈 후 다시 업로드해 주세요.`,
        },
        { status: 400 }
      );
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: "not_image",
          message: `'${file.name}' 은(는) 허용된 이미지 형식(JPEG/PNG/WebP)이 아닙니다.`,
        },
        { status: 400 }
      );
    }
  }

  const paths: string[] = [];
  const failed: { name: string; reason: string }[] = [];

  for (const file of files) {
    const path = `${Date.now()}-${randomUUID().slice(0, 8)}.jpg`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(SPOT_PHOTOS_BUCKET).upload(path, bytes, {
      contentType: file.type, // 안전목록 통과 값만 도달 — 폴백 없음
      upsert: false,
    });
    if (error) {
      console.error("[admin/spots/photos] upload failed:", error.message);
      failed.push({ name: file.name, reason: "Storage 업로드에 실패했습니다." });
    } else {
      paths.push(path);
    }
  }

  if (paths.length === 0) {
    return NextResponse.json(
      {
        error: "upload_failed",
        message: "사진 업로드에 모두 실패했습니다. 잠시 후 다시 시도해 주세요.",
        failed,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ paths, failed });
}
