import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RouteViewer from "@/components/route/RouteViewer";
import { getRouteWithWaypoints } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface RoutePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: RoutePageProps): Promise<Metadata> {
  const data = await getRouteWithWaypoints(params.slug);
  if (!data) return { title: "Course not found — K-RoadTrip" };
  return {
    title: `${data.route.title_en} — K-RoadTrip`,
    description: data.route.description_en ?? undefined,
  };
}

export default async function RoutePage({ params }: RoutePageProps) {
  const data = await getRouteWithWaypoints(params.slug);
  if (!data || data.waypoints.length === 0) notFound();
  return <RouteViewer route={data.route} waypoints={data.waypoints} />;
}
