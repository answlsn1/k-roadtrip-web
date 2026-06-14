import type { Metadata } from "next";
import RouteBuilder from "@/components/builder/RouteBuilder";
import { getAllWaypointsForMap } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build Your Route — K-RoadTrip",
  description:
    "Search Korean places and build your own road trip — then open it in Naver Map with every stop pre-filled. No login needed.",
};

export default async function BuilderPage() {
  const curatedData = await getAllWaypointsForMap();
  return <RouteBuilder curatedData={curatedData} />;
}
