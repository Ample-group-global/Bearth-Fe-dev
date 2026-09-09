"use client";

import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import CityFallback from "./CityFallback";

const CityScene = dynamic(() => import("./CityScene"), { ssr: false });

function CityStatus() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <div className="size-10 animate-spin rounded-full border-2 border-white/30 border-t-primary" />
    </div>
  );
}

export default function CityExperience() {
  const webglSupported = useWebGLSupport();

  if (webglSupported === null) {
    return <CityStatus />;
  }

  if (!webglSupported) {
    return <CityFallback />;
  }

  return (
    <div className="h-full w-full">
      <CityScene />
    </div>
  );
}
