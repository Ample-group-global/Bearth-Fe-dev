"use client";

import { ContactShadows, Sparkles, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";
import { Suspense, useRef } from "react";
import type * as THREE from "three";
import CityBears from "./CityBears";
import CityCameraRig from "./CityCameraRig";
import CityCloudsAndBirds from "./CityCloudsAndBirds";
import CityEnvironment from "./CityEnvironment";
import CityFlyingRockets from "./CityFlyingRockets";
import CityIsland from "./CityIsland";
import CityLoader from "./CityLoader";
import CityPortals from "./CityPortals";

/** Gentle vertical drift selling the "floating city" premise. */
function CityFloatGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    group.position.y = Math.sin(clock.getElapsedTime() * 0.25) * 0.2;
  });

  return <group ref={groupRef}>{children}</group>;
}

function CityMist() {
  // Each sphere (radius 21) is centered well below the ground plane so only
  // a shallow cap breaks the horizon — the previous y-values (-9 to -15)
  // left 6-12 units poking above ground, which read as a solid grey
  // "mountain" silhouette against the night sky instead of a soft haze
  // bank. Now only ~2 units of each dome clears y=0.
  const spots: Array<[number, number, number]> = [
    [39, -16, 24],
    [-42, -19, -15],
    [19.5, -19, -48],
    [-24, -15, 43.5],
  ];

  return (
    <>
      {spots.map((position) => (
        <mesh key={position.join("-")} position={position}>
          <sphereGeometry args={[21, 16, 12]} />
          <meshBasicMaterial color="#dce8f5" transparent opacity={0.04} />
        </mesh>
      ))}
    </>
  );
}

export default function CityScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 55, 63], fov: 55 }}
    >
      <color attach="background" args={["#0c1226"]} />
      <fog attach="fog" args={["#141b33", 63, 135]} />

      <Stars
        radius={140}
        depth={60}
        count={6000}
        factor={7}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* Flying stars — a drifting shimmer layer above the whole city,
          distinct from the static background Stars field and from the
          Energy Park's own localized firefly Sparkles */}
      <Sparkles
        count={140}
        scale={[110, 45, 110]}
        size={4.5}
        speed={0.35}
        opacity={0.55}
        color="#cfe6ff"
        position={[0, 32, 0]}
      />

      <Suspense fallback={<CityLoader />}>
        <CityFloatGroup>
          <CityEnvironment />
          <CityIsland />
          <CityPortals />
          <CityBears />
          <CityFlyingRockets />
          <CityCloudsAndBirds />
          <CityMist />
          {/* A local ground-contact darkening near the plaza, not a plane
              spanning the whole world — a much larger scale here made its
              own soft-edged boundary visible as a big dark rectangle on the
              reflective floor. */}
          <ContactShadows
            position={[0, 0.015, 0]}
            opacity={0.45}
            scale={44}
            blur={2.6}
            far={10}
            resolution={512}
            color="#00040f"
          />
        </CityFloatGroup>
        <CityCameraRig />
      </Suspense>

      <EffectComposer multisampling={0}>
        <N8AO aoRadius={2.5} intensity={1.3} distanceFalloff={1} />
        <Bloom
          luminanceThreshold={0.35}
          luminanceSmoothing={0.85}
          intensity={0.8}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
