"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface FlyingRocketConfig {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
}

/**
 * Small decorative rockets looping the city at altitude, well outside the
 * landmark ring (radius 21-46) so they never visually compete with a
 * landmark's own silhouette — purely atmospheric, not interactive.
 */
const ROCKETS: FlyingRocketConfig[] = [
  { radius: 55, height: 30, speed: 0.09, phase: 0, color: "#e8ecf2" },
  { radius: 68, height: 38, speed: -0.06, phase: 2.4, color: "#dfe6f0" },
  { radius: 60, height: 24, speed: 0.12, phase: 4.5, color: "#e2e7ee" },
  { radius: 75, height: 33, speed: -0.08, phase: 1.1, color: "#e6eaf0" },
];

function FlyingRocket({ config }: { config: FlyingRocketConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const nextPos = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime() * config.speed + config.phase;
    const bob = Math.sin(t * 1.7) * 1.5;
    group.position.set(
      Math.cos(t) * config.radius,
      config.height + bob,
      Math.sin(t) * config.radius,
    );

    // Face the direction of travel a moment ahead on the same orbit path
    const tAhead = t + 0.05 * Math.sign(config.speed || 1);
    nextPos.current.set(
      Math.cos(tAhead) * config.radius,
      config.height + Math.sin(tAhead * 1.7) * 1.5,
      Math.sin(tAhead) * config.radius,
    );
    group.lookAt(nextPos.current);
  });

  return (
    <group ref={groupRef}>
      {/* Body — lookAt orients -Z forward, so the nose sits at -Z */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 2.6, 14]} />
        <meshStandardMaterial color={config.color} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 0.35, 14]} />
        <meshStandardMaterial
          color="#41afeb"
          emissive="#41afeb"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -1.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.45, 1.1, 14]} />
        <meshStandardMaterial color={config.color} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Fins at the tail */}
      {[0, 2.09, 4.19].map((rot) => (
        <mesh key={rot} position={[0, 0, 1.1]} rotation={[0, 0, rot]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.7]} />
          <meshStandardMaterial color={config.color} roughness={0.35} metalness={0.3} />
        </mesh>
      ))}
      {/* Engine glow trail, behind at +Z */}
      <mesh position={[0, 0, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 2.1, 12]} />
        <meshStandardMaterial
          color="#8fd0ff"
          emissive="#8fd0ff"
          emissiveIntensity={2.4}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function CityFlyingRockets() {
  return (
    <>
      {ROCKETS.map((config) => (
        <FlyingRocket key={config.phase} config={config} />
      ))}
    </>
  );
}
