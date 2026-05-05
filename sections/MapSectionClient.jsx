"use client";
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("@/sections/MapSection"), { ssr: false });

export default function MapSectionClient() {
  return <MapSection />;
}