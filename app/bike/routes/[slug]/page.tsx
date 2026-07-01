import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import SiteFooter from "@/components/home/SiteFooter";
import BikeRouteDetail from "@/components/bike/BikeRouteDetail";
import { getBikeRoute } from "@/lib/config/bikeRoutes";

interface BikeRoutePageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: BikeRoutePageProps): Metadata {
  const route = getBikeRoute(params.slug);
  if (!route) return { title: "Route not found — Bike-RoadTrip" };
  return {
    title: `${route.name_en} — Bike-RoadTrip`,
    description: route.summary_en,
  };
}

export default function BikeRoutePage({ params }: BikeRoutePageProps) {
  const route = getBikeRoute(params.slug);
  if (!route) notFound();

  return (
    <main>
      <Navbar mode="bike" />
      <BikeRouteDetail route={route} />
      <SiteFooter />
    </main>
  );
}
