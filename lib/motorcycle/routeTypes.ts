/* 루트 유형 — 마이그레이션 0008 의 route_type CHECK 값과 1:1. */

export type MotorcycleRouteType = "winding" | "touring" | "offroad" | "city";

export const ROUTE_TYPES: { value: MotorcycleRouteType; emoji: string; label: string }[] = [
  { value: "winding", emoji: "🏔️", label: "와인딩" },
  { value: "touring", emoji: "🛣️", label: "투어링" },
  { value: "offroad", emoji: "🌲", label: "임도·오프로드" },
  { value: "city", emoji: "🌃", label: "시내·근교" },
];

export function routeTypeMeta(
  value: string | null
): { emoji: string; label: string } | null {
  if (!value) return null;
  const found = ROUTE_TYPES.find((t) => t.value === value);
  return found ? { emoji: found.emoji, label: found.label } : null;
}
