"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ComponentRef, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function CityCameraRig() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  // Gentle back-and-forth sway instead of an endless one-direction spin —
  // reverses smoothly on a sine curve so idle motion doesn't read as a
  // repetitive carousel.
  useFrame(({ clock }) => {
    const controls = controlsRef.current;
    if (!controls || prefersReducedMotion) return;
    controls.autoRotateSpeed = Math.sin(clock.getElapsedTime() * 0.12) * 0.5;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 1.5, 0]}
      enablePan
      panSpeed={0.8}
      screenSpacePanning={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={18}
      maxDistance={115}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.3}
      autoRotate={!prefersReducedMotion}
    />
  );
}
