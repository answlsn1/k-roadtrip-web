import type { MetadataRoute } from "next";
import { getPublishedRoutes } from "@/lib/data/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://k-roadtrip.app";

// Dynamic sitemap: home + builder + every published course, so crawlers can
// reach the route-detail pages (the key landing pages for organic traffic).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getPublishedRoutes().catch(() => []);
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/builder`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...routes.map((r) => ({
      url: `${base}/routes/${r.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
