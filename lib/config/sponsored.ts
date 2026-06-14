import type { PlaceResult } from "@/lib/types";

export interface SponsoredPlace extends PlaceResult {
  source: "sponsored";
  region_en: string;
  description_en: string;
  video_url: string;
  thumbnail_url: string;
  benefits: string[];
}

// Dummy B2B partner data — replace with Supabase `sponsored_places` table in prod.
export const SPONSORED_PLACES: SponsoredPlace[] = [
  {
    sourceId: "sp-daegu-hanok-cafe",
    source: "sponsored",
    name_en: "Premium Hanok Cafe",
    name_ko: "프리미엄 한옥 카페",
    latitude: 35.8714,
    longitude: 128.6014,
    subtitle: "Daegu · Traditional Hanok · Specialty coffee",
    type_tag: "cafe",
    region_en: "Daegu",
    description_en: "Authentic hanok courtyard café with specialty Korean coffee & traditional desserts.",
    video_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail_url:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=640&q=70",
    benefits: ["10% Off", "Free Parking", "English Menu"],
  },
  {
    sourceId: "sp-jeju-rentcar",
    source: "sponsored",
    name_en: "Jeju Easy-RentCar",
    name_ko: "제주 이지렌트카",
    latitude: 33.4996,
    longitude: 126.5312,
    subtitle: "Jeju · English OK · Free airport delivery",
    type_tag: "landmark",
    region_en: "Jeju",
    description_en: "Best-rated English-friendly car rental on Jeju. Free delivery to any airport gate.",
    video_url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=640&q=70",
    benefits: ["Free Hi-Pass", "English Support", "Full Insurance"],
  },
];
