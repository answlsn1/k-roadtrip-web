import type { MetadataRoute } from "next";
import { getPublishedRoutes } from "@/lib/data/queries";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://k-roadtrip.app";

// Next.js metadata routes (sitemap.ts) are static by default — without this,
// the file is generated once at build/deploy time and Vercel serves that same
// snapshot indefinitely (found stale at 69h+ old, silently missing every route
// published between deploys). `revalidate` alone still built as static (○) with
// no ISR annotation for this route-handler convention file, so force it dynamic
// like the homepage (same pattern, confirmed working via Cache-Control headers).
export const dynamic = "force-dynamic";

// Dynamic sitemap: home + builder + every published course, so crawlers can
// reach the route-detail pages (the key landing pages for organic traffic).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getPublishedRoutes().catch(() => []);
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/builder`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    // AdSense 심사자·크롤러가 방침 페이지에 도달할 수 있어야 한다(noindex 금지).
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...routes.map((r) => ({
      url: `${base}/routes/${r.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
