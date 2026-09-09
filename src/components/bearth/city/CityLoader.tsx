"use client";

import { Html } from "@react-three/drei";

export default function CityLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-white">
        <div className="size-10 animate-spin rounded-full border-2 border-white/30 border-t-primary" />
        <p className="text-sm uppercase tracking-wide">Loading Bearth City…</p>
      </div>
    </Html>
  );
}
