"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** A soft cluster of overlapping spheres — reads as a puffy cloud, not a
 * single hard ball. */
function Cloud({
  x,
  y,
  z,
  scale,
}: {
  x: number;
  y: number;
  z: number;
  scale: number;
}) {
  const puffs = useMemo(
    () => [
      { pos: [0, 0, 0] as const, r: 2.4 },
      { pos: [2.1, 0.3, 0.4] as const, r: 1.8 },
      { pos: [-2.0, 0.2, -0.3] as const, r: 1.9 },
      { pos: [0.6, 0.9, 0.8] as const, r: 1.5 },
      { pos: [-0.8, 0.7, -0.6] as const, r: 1.4 },
    ],
    [],
  );

  return (
    <group position={[x, y, z]} scale={scale}>
      {puffs.map((puff) => (
        <mesh key={puff.pos.join("-")} position={puff.pos}>
          <sphereGeometry args={[puff.r, 12, 10]} />
          <meshStandardMaterial
            color="#e8edf5"
            roughness={0.9}
            transparent
            opacity={0.75}
          />
        </mesh>
      ))}
    </group>
  );
}

const CLOUDS = [
  { x: 30, y: 34, z: 10, s: 1.4 },
  { x: -25, y: 40, z: 25, s: 1.7 },
  { x: 5, y: 37, z: -35, s: 1.5 },
  { x: -38, y: 32, z: -12, s: 1.3 },
  { x: 42, y: 38, z: -20, s: 1.6 },
  { x: -10, y: 44, z: 40, s: 1.5 },
];

interface BirdConfig {
  radius: number;
  height: number;
  speed: number;
  phase: number;
}

const BIRDS: BirdConfig[] = [
  { radius: 22, height: 36, speed: 0.22, phase: 0 },
  { radius: 26, height: 38, speed: 0.22, phase: 0.4 },
  { radius: 24, height: 34, speed: 0.22, phase: 0.8 },
  { radius: 33, height: 41, speed: -0.18, phase: 1.6 },
  { radius: 36, height: 39, speed: -0.18, phase: 2.0 },
  { radius: 18, height: 33, speed: 0.28, phase: 3.2 },
  { radius: 20, height: 33, speed: 0.28, phase: 3.5 },
];

function Bird({ config }: { config: BirdConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingLeft = useRef<THREE.Mesh>(null);
  const wingRight = useRef<THREE.Mesh>(null);
  const nextPos = useRef(new THREE.Vector3());

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime() * config.speed + config.phase;
    const bob = Math.sin(t * 2.3) * 0.6;
    group.position.set(
      Math.cos(t) * config.radius,
      config.height + bob,
      Math.sin(t) * config.radius,
    );

    const tAhead = t + 0.04 * Math.sign(config.speed || 1);
    nextPos.current.set(
      Math.cos(tAhead) * config.radius,
      config.height + Math.sin(tAhead * 2.3) * 0.6,
      Math.sin(tAhead) * config.radius,
    );
    group.lookAt(nextPos.current);

    const flap = Math.sin(clock.getElapsedTime() * 9 + config.phase * 5);
    if (wingLeft.current) wingLeft.current.rotation.z = flap * 0.6;
    if (wingRight.current) wingRight.current.rotation.z = -flap * 0.6;
  });

  return (
    <group ref={groupRef}>
      {/* Light, high-contrast colors — the original dark navy blended
          almost exactly into the night-sky background, making the birds
          render correctly but read as invisible. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.13, 0.45, 4, 8]} />
        <meshStandardMaterial
          color="#e8edf5"
          emissive="#e8edf5"
          emissiveIntensity={0.3}
          roughness={0.6}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={wingLeft} position={[0.11, 0, 0]}>
        <planeGeometry args={[0.85, 0.26]} />
        <meshStandardMaterial
          color="#cfd8ea"
          emissive="#cfd8ea"
          emissiveIntensity={0.25}
          roughness={0.6}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={wingRight} position={[-0.11, 0, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.85, 0.26]} />
        <meshStandardMaterial
          color="#cfd8ea"
          emissive="#cfd8ea"
          emissiveIntensity={0.25}
          roughness={0.6}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default function CityCloudsAndBirds() {
  return (
    <>
      {CLOUDS.map((cloud) => (
        <Cloud
          key={`${cloud.x}-${cloud.z}`}
          x={cloud.x}
          y={cloud.y}
          z={cloud.z}
          scale={cloud.s}
        />
      ))}
      {BIRDS.map((config) => (
        <Bird key={config.phase} config={config} />
      ))}
    </>
  );
}
