import type { PlaceResult } from "@/lib/types";

export interface SponsoredPlace extends PlaceResult {
  source: "sponsored";
  region_en: string;
  description_en: string;
  /** Self-hosted Korean clip. "" → card shows the poster (thumbnail) only. */
  video_url: string;
  thumbnail_url: string;
  benefits: string[];
  /** Outbound partner booking/affiliate link (include tracking params). "" → no CTA shown. */
  affiliate_url: string;
  /** Optional per-partner CTA label override. Falls back to t("card.book"). */
  cta_label_en?: string;
  cta_label_ko?: string;
}

// ─── Real sponsor/partner slots ──────────────────────────────────────────────
// Production sponsor data goes here (long-term: Supabase `sponsored_places` table).
// HARD RULE (CLAUDE.md §5): no placeholder/sample media or dead links in prod —
// insert real, local-verified partners only. Empty array → the Sponsored row is
// hidden on the home feed. See CONTENT-TODO.md.
//
// Template — copy, fill EVERY field, then push into the array:
//   {
//     sourceId: "sp-<unique-id>",
//     source: "sponsored",
//     name_en: "", name_ko: "",
//     latitude: 0, longitude: 0,
//     subtitle: "",
//     type_tag: "landmark",
//     region_en: "",
//     description_en: "",
//     video_url: "",            // self-hosted Korean clip (or "" → poster only)
//     thumbnail_url: "",        // real image
//     benefits: [],
//     affiliate_url: "",        // partner booking link WITH tracking params
//     cta_label_en: "Book Now", cta_label_ko: "예약하기",
//   },
export const SPONSORED_PLACES: SponsoredPlace[] = [];
