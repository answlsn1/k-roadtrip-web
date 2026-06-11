/* ============================================================
 * Browser environment detection — used to route around the two
 * places where the core loop silently dies for foreign users:
 *   1) custom schemes (nmap://) blocked in in-app browsers
 *   2) Google OAuth refusing in-app webviews (disallowed_useragent)
 * ============================================================ */

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|DaumApps|Snapchat|TikTok|musical_ly|; wv\)/i.test(
    navigator.userAgent
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ reports as Macintosh but has touch
    (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}
