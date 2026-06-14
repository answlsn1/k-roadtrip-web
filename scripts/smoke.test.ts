/* Runtime smoke test for pure logic modules (run: npx tsx scripts/smoke.test.ts) */
import {
  buildNaverCarRouteLink,
  buildKoreanAddressList,
  toAndroidIntentUrl,
  buildNaverWebSearchUrl,
  type NaverRoutePoint,
} from "../lib/domain/naverMapLink";
import { typeMeta } from "../lib/config/constants";

let failures = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (cond) console.log(`  ok - ${name}`);
  else {
    failures++;
    console.error(`FAIL - ${name}${detail ? ` :: ${detail}` : ""}`);
  }
}

const pt = (seq: number, name: string): NaverRoutePoint => ({
  sequence: seq,
  place_name_ko: name,
  latitude: 35 + seq * 0.01,
  longitude: 129 + seq * 0.01,
  address_ko: `주소 ${seq}`,
});

console.log("[1] multi-waypoint route link");
const four = [pt(1, "출발지"), pt(2, "경유1"), pt(3, "경유2"), pt(4, "도착지 국밥")];
const url4 = buildNaverCarRouteLink(four);
check("scheme/path", url4.startsWith("nmap://route/car?"));
check("start params", url4.includes("slat=35.01") && url4.includes(`sname=${encodeURIComponent("출발지")}`));
check("dest params", url4.includes("dlat=35.04") && url4.includes(`dname=${encodeURIComponent("도착지 국밥")}`));
check("via params v1+v2", url4.includes(`v1name=${encodeURIComponent("경유1")}`) && url4.includes(`v2name=${encodeURIComponent("경유2")}`));
check("appname", url4.includes("appname=kroadtrip"));
check("UTF-8 encoded (no raw hangul)", !/[가-힣]/.test(url4));

console.log("[2] via cap: 9 stops -> max 5 vias, order preserved");
const nine = Array.from({ length: 9 }, (_, i) => pt(i + 1, `스팟${i + 1}`));
const url9 = buildNaverCarRouteLink(nine);
check("v5 exists", url9.includes("v5name="));
check("v6 absent", !url9.includes("v6name="));
check("first via is original 2nd stop", url9.includes(`v1name=${encodeURIComponent("스팟2")}`));
check("last via is original 8th stop", url9.includes(`v5name=${encodeURIComponent("스팟8")}`));

console.log("[3] single stop from current location");
const url1 = buildNaverCarRouteLink([pt(7, "단일목적지")], { useCurrentLocationAsStart: true });
check("no start params", !url1.includes("slat="));
check("no vias", !url1.includes("v1lat="));
check("dest set", url1.includes(`dname=${encodeURIComponent("단일목적지")}`));

console.log("[4] android intent url");
const intent = toAndroidIntentUrl(url4, buildNaverWebSearchUrl(four[3]));
check("intent scheme", intent.startsWith("intent://route/car?"));
check("package present", intent.includes("package=com.nhn.android.nmap"));
check("fallback url encoded", intent.includes("S.browser_fallback_url=https%3A%2F%2Fmap.naver.com"));
check("terminated with ;end", intent.endsWith(";end"));

console.log("[5] korean address list (clipboard fallback)");
const listText = buildKoreanAddressList(four);
check("4 lines", listText.split("\n").length === 4);
check("numbered + name + address", listText.startsWith("1. 출발지 — 주소 1"));

console.log("[6] type registry");
check("known tag", typeMeta("hanok_cafe").label_en === "Hanok Cafe" && typeMeta("hanok_cafe").color === "#c2410c");
check("fallback prettified", typeMeta("night_market").label_en === "Night Market");
check("fallback color", typeMeta("night_market").color === "#334155");

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
