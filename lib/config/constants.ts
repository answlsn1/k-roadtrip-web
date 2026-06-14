export interface TypeTagMeta {
  color: string;
  label_en: string;
  label_ko: string;
}

export const TYPE_TAGS = {
  cafe:       { color: "#f59e0b", label_en: "Cafe",       label_ko: "카페" },
  restaurant: { color: "#ef4444", label_en: "Restaurant", label_ko: "식당" },
  bakery:     { color: "#a855f7", label_en: "Bakery",     label_ko: "베이커리" },
  sights:     { color: "#0ea5e9", label_en: "Sights",     label_ko: "명소" },
  heritage:   { color: "#92400e", label_en: "Heritage",   label_ko: "문화유산" },
  scenic:     { color: "#10b981", label_en: "Scenic",     label_ko: "풍경 명소" },
  hanok_cafe: { color: "#c2410c", label_en: "Hanok Cafe", label_ko: "한옥 카페" },
  landmark:   { color: "#6366f1", label_en: "Landmark",   label_ko: "랜드마크" },
  beach:      { color: "#06b6d4", label_en: "Beach",      label_ko: "해변" },
  rest_area:  { color: "#64748b", label_en: "Rest Area",  label_ko: "휴게소" },
} satisfies Record<string, TypeTagMeta>;

export type TypeTag = keyof typeof TYPE_TAGS;

const FALLBACK: TypeTagMeta = { color: "#334155", label_en: "Spot", label_ko: "스팟" };

export function typeMeta(tag: string): TypeTagMeta {
  return (
    (TYPE_TAGS as Record<string, TypeTagMeta>)[tag] ?? {
      ...FALLBACK,
      label_en: tag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }
  );
}

export const NAVER_GREEN = "#03C75A";
