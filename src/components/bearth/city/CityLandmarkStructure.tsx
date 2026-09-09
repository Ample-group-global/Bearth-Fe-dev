"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import type { CityLandmarkShape } from "./city-portals.config";
import { getFacadeTexture } from "./facade-texture";

interface CityLandmarkStructureProps {
  shape: CityLandmarkShape;
  color: string;
  emissiveIntensity: number;
  /** Vertical scale applied only to the upper structure — landmarks vary in height, not footprint. */
  heightScale: number;
}

const WINDOW_COLOR = "#ffe9b8";
const DARK = "#101a33";
const STONE = "#4d473d";
const STONE_DARK = "#39352e";

function Door({ z, width = 0.5 }: { z: number; width?: number }) {
  return (
    <mesh position={[0, 0.55, z]}>
      <planeGeometry args={[width, 0.9]} />
      <meshStandardMaterial color="#060a17" roughness={0.9} side={2} />
    </mesh>
  );
}

function PyramidRoof({
  size,
  height,
  y,
  color,
  emissiveIntensity,
}: {
  size: number;
  height: number;
  y: number;
  color: string;
  emissiveIntensity: number;
}) {
  return (
    <mesh position={[0, y, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[size, height, 4]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.3}
        clearcoat={0.5}
      />
    </mesh>
  );
}

/** Faceted textured box — real windows baked into a cached canvas texture instead of individual meshes. */
function FacadeBox({
  size,
  y,
  color,
}: {
  size: [number, number, number];
  y: number;
  color: string;
}) {
  const facade = useMemo(() => getFacadeTexture(color), [color]);
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        attach="material-0"
        map={facade}
        roughness={0.4}
        clearcoat={0.4}
      />
      <meshPhysicalMaterial
        attach="material-1"
        map={facade}
        roughness={0.4}
        clearcoat={0.4}
      />
      <meshPhysicalMaterial attach="material-2" color={color} roughness={0.4} />
      <meshPhysicalMaterial attach="material-3" color={color} roughness={0.4} />
      <meshPhysicalMaterial
        attach="material-4"
        map={facade}
        roughness={0.4}
        clearcoat={0.4}
      />
      <meshPhysicalMaterial
        attach="material-5"
        map={facade}
        roughness={0.4}
        clearcoat={0.4}
      />
    </mesh>
  );
}

/** Faceted textured cylinder wall — side face gets windows, caps stay flat color. */
function FacadeDrum({
  radiusTop,
  radiusBottom,
  height,
  y,
  color,
  segments = 24,
}: {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  y: number;
  color: string;
  segments?: number;
}) {
  const facade = useMemo(() => getFacadeTexture(color), [color]);
  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
      <meshPhysicalMaterial
        attach="material-0"
        map={facade}
        roughness={0.4}
        clearcoat={0.4}
      />
      <meshPhysicalMaterial attach="material-1" color={color} roughness={0.4} />
      <meshPhysicalMaterial attach="material-2" color={color} roughness={0.4} />
    </mesh>
  );
}

function Columns({
  count,
  radius,
  y,
  height,
  color,
}: {
  count: number;
  radius: number;
  y: number;
  height: number;
  color: string;
}) {
  const angles = Array.from(
    { length: count },
    (_, i) => Math.PI * (0.15 + (i / (count - 1)) * 0.7),
  );
  return (
    <>
      {angles.map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
          castShadow
        >
          <cylinderGeometry args={[0.07, 0.08, height, 10]} />
          <meshStandardMaterial color={color} roughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

function MarketStalls({
  color,
  emissiveIntensity,
}: {
  color: string;
  emissiveIntensity: number;
}) {
  // Clear of the mall body's 2.4x1.8 footprint on at least one axis, so
  // stalls never clip into the enlarged building. The right-hand accent
  // stall is swung from 0.75 down to 0.25 in z (same ~1.86 distance from
  // center, just a shallower angle) — every landmark's Hoarding sits at a
  // fixed local offset in the ~38-41° direction, and this stall's original
  // spot plus its 0.85-radius roof cone reached ~8.1 units out, well past
  // the sign's own ~6.7-unit radius, so the roof was poking in front of
  // the board from that angle. The new angle (~8°) is clear of it.
  const stalls: Array<{ position: [number, number]; accent: boolean }> = [
    { position: [0, -1.35], accent: false },
    { position: [-1.7, 0.75], accent: true },
    { position: [1.85, 0.25], accent: true },
  ];
  const accentColor = "#f0ead6";

  return (
    <>
      {stalls.map((stall) => (
        <group
          key={stall.position.join("-")}
          position={[stall.position[0], 0, stall.position[1]]}
        >
          {[
            [0.55, 0.55],
            [0.55, -0.55],
            [-0.55, 0.55],
            [-0.55, -0.55],
          ].map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, 0.7, z]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 1.4, 8]} />
              <meshStandardMaterial color={DARK} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshPhysicalMaterial
              color={stall.accent ? accentColor : color}
              roughness={0.4}
              clearcoat={0.3}
            />
          </mesh>
          <mesh
            position={[0, 1.55, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow
          >
            <coneGeometry args={[0.85, 0.7, 4]} />
            <meshPhysicalMaterial
              color={stall.accent ? accentColor : color}
              emissive={stall.accent ? accentColor : color}
              emissiveIntensity={emissiveIntensity * 0.7}
              roughness={0.35}
              clearcoat={0.4}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/**
 * Procedural building silhouette for a landmark, built entirely from
 * primitive geometry and a cached canvas facade texture (no external
 * models/network). Every one of the 13 landmarks gets its OWN silhouette
 * matching its actual canon concept — not a shared shape recolored.
 */
export default function CityLandmarkStructure({
  shape,
  color,
  emissiveIntensity,
  heightScale,
}: CityLandmarkStructureProps) {
  // Every landmark's base ring breathes with a slow glow pulse — one shared
  // "the city is alive" cue applied uniformly instead of hand-animating all
  // 13 silhouettes individually. Mutated directly on the material each
  // frame (not via React state) so it costs nothing beyond a sine call.
  const ringMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (ringMaterialRef.current) {
      ringMaterialRef.current.emissiveIntensity =
        emissiveIntensity *
        (0.8 + Math.sin(clock.getElapsedTime() * 1.4) * 0.2);
    }
  });

  return (
    <group scale={3.3}>
      {/* Foundation platform, shared by every landmark — footprint stays consistent even as height varies */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.55, 0.36, 32]} />
        <meshPhysicalMaterial color={DARK} roughness={0.5} clearcoat={0.4} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 48]} />
        <meshStandardMaterial
          ref={ringMaterialRef}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>

      <group scale={[1, heightScale, 1]}>
        {shape === "rocket" && (
          <>
            {/* Launch pad ring — a flame trench at the base instead of the
                rocket just standing bare on the shared foundation */}
            <mesh position={[0, 0.05, 0]}>
              <torusGeometry args={[1.0, 0.075, 12, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity * 1.3}
                toneMapped={false}
              />
            </mesh>

            {/* Gantry — two angled support struts cradling the rocket, like
                a real launch tower, not a bare cylinder floating on a disc */}
            {[Math.PI * 0.3, Math.PI * 1.3].map((rot) => (
              <group key={rot} rotation={[0, rot, 0]}>
                <mesh
                  position={[0.82, 0.75, 0]}
                  rotation={[0, 0, -0.28]}
                  castShadow
                >
                  <boxGeometry args={[0.1, 1.7, 0.1]} />
                  <meshStandardMaterial color={DARK} roughness={0.6} />
                </mesh>
                <mesh position={[0.78, 1.15, 0]} castShadow>
                  <boxGeometry args={[0.38, 0.07, 0.07]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            ))}

            {/* Body — a smooth two-stage rocket hull, NOT the windowed
                FacadeDrum used on every skyscraper — a rocket doesn't have
                office windows, and reusing that building texture here was
                the main reason this read as a windowed tower wearing a
                cone hat instead of a launch vehicle. Booster stage tapers
                into a narrower upper stage at a visible separation ring,
                the way a real multi-stage rocket actually reads. */}
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.64, 0.74, 0.95, 20]} />
              <meshPhysicalMaterial
                color="#e8ecf2"
                roughness={0.35}
                metalness={0.3}
                clearcoat={0.4}
              />
            </mesh>
            {/* Booster accent stripe */}
            <mesh position={[0, 0.72, 0]}>
              <cylinderGeometry args={[0.68, 0.68, 0.18, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                toneMapped={false}
              />
            </mesh>
            {/* Fins at the booster's base — real rocket tail fins, not
                mid-body blades */}
            {[0, 2.09, 4.19].map((rot) => (
              <mesh
                key={rot}
                position={[0, 0.32, 0]}
                rotation={[0, rot, 0]}
                castShadow
              >
                <boxGeometry args={[0.08, 0.6, 0.65]} />
                <meshPhysicalMaterial
                  color={color}
                  roughness={0.4}
                  clearcoat={0.3}
                />
              </mesh>
            ))}
            {/* Stage-separation ring */}
            <mesh position={[0, 1.0, 0]}>
              <torusGeometry args={[0.53, 0.045, 10, 24]} />
              <meshStandardMaterial
                color={DARK}
                roughness={0.45}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.43, 0.5, 1.05, 20]} />
              <meshPhysicalMaterial
                color="#e8ecf2"
                roughness={0.3}
                metalness={0.3}
                clearcoat={0.5}
              />
            </mesh>
            {/* Crew capsule window — a single porthole near the nose
                instead of a row of building-style windows */}
            <mesh position={[0, 1.85, 0.45]}>
              <circleGeometry args={[0.12, 20]} />
              <meshStandardMaterial
                color={WINDOW_COLOR}
                emissive={WINDOW_COLOR}
                emissiveIntensity={1.3}
                toneMapped={false}
                side={2}
              />
            </mesh>
            <mesh position={[0, 1.85, 0.46]}>
              <torusGeometry args={[0.14, 0.02, 8, 20]} />
              <meshStandardMaterial
                color={DARK}
                roughness={0.5}
                metalness={0.3}
              />
            </mesh>
            <mesh position={[0, 2.72, 0]} castShadow>
              <coneGeometry args={[0.5, 1.45, 24]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
                clearcoat={0.7}
                clearcoatRoughness={0.15}
              />
            </mesh>
            {/* Beacon light at the very tip */}
            <mesh position={[0, 3.5, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="#ff6b6b"
                emissive="#ff6b6b"
                emissiveIntensity={2}
                toneMapped={false}
              />
            </mesh>
          </>
        )}

        {shape === "transit-hub" && (
          <>
            <FacadeDrum
              radiusTop={1.2}
              radiusBottom={1.32}
              height={1.15}
              y={0.75}
              color={color}
            />
            {/* Wide, shallow platform canopy — flat like a station awning, not dome-shaped */}
            <mesh
              position={[0, 1.35, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry
                args={[2.2, 2.2, 2.4, 20, 1, true, 0, Math.PI * 0.65]}
              />
              <meshPhysicalMaterial
                color={color}
                roughness={0.3}
                clearcoat={0.5}
                side={2}
              />
            </mesh>
            <mesh position={[0, 1.65, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
            <mesh position={[0, 2.1, 0]}>
              <sphereGeometry args={[0.1, 12, 10]} />
              <meshStandardMaterial
                color={WINDOW_COLOR}
                emissive={WINDOW_COLOR}
                emissiveIntensity={1.3}
                toneMapped={false}
              />
            </mesh>
          </>
        )}

        {shape === "stream-pavilion" && (
          <>
            {[
              [1.25, 1.25],
              [1.25, -1.25],
              [-1.25, 1.25],
              [-1.25, -1.25],
            ].map(([x, z]) => (
              <mesh key={`${x}-${z}`} position={[x, 1.15, z]} castShadow>
                <cylinderGeometry args={[0.2, 0.24, 1.9, 16]} />
                <meshPhysicalMaterial
                  color={color}
                  roughness={0.35}
                  clearcoat={0.4}
                />
              </mesh>
            ))}
            <mesh position={[0, 2.15, 0]} castShadow>
              <cylinderGeometry args={[1.95, 1.75, 0.34, 32]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.25}
                metalness={0.15}
                clearcoat={0.5}
              />
            </mesh>
            <mesh position={[0, 2.65, 0]} castShadow>
              <coneGeometry args={[1.55, 0.9, 32]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
                clearcoat={0.7}
                clearcoatRoughness={0.15}
              />
            </mesh>
            {/* Glowing stream winding past the pavilion */}
            {[
              [2.3, 0, 0],
              [2.7, 0, 0.6],
              [3.0, 0, 1.3],
            ].map(([x, , z]) => (
              <mesh
                key={`${x}-${z}`}
                position={[x, 0.08, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[0.4, 16]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  toneMapped={false}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
          </>
        )}

        {shape === "museum" && (
          <>
            <FacadeDrum
              radiusTop={1.35}
              radiusBottom={1.48}
              height={1.15}
              y={0.75}
              color={DARK}
            />
            <Columns
              count={6}
              radius={1.62}
              y={0.75}
              height={1.15}
              color={color}
            />
            <Door z={1.55} width={0.6} />
            <mesh position={[0, 1.35, 0]} castShadow>
              <sphereGeometry
                args={[1.28, 28, 20, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                roughness={0.12}
                clearcoat={0.9}
                clearcoatRoughness={0.1}
              />
            </mesh>

            {/* Floating memory-frame gallery, ringing the hall just outside
                the colonnade — each a small glowing framed portrait, one
                per preserved explorer journey. This is what actually makes
                it read as a MEMORY hall rather than a generic domed
                museum/capitol: framed plaques, not orbs (Dream Archive
                already owns the crystal-ball motif for stored dreams), on
                display in an ever-expanding ring instead of tucked inside. */}
            {[0, 1.05, 2.1, 3.15, 4.2, 5.25].map((angle, i) => (
              <group
                key={angle}
                position={[
                  Math.cos(angle) * 1.85,
                  0.9 + (i % 3) * 0.35,
                  Math.sin(angle) * 1.85,
                ]}
                rotation={[0, -angle + Math.PI / 2, 0]}
              >
                <mesh castShadow>
                  <boxGeometry args={[0.22, 0.28, 0.03]} />
                  <meshStandardMaterial color={DARK} roughness={0.6} />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <planeGeometry args={[0.16, 0.22]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity * 1.1}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {shape === "pod-cluster" && (
          <>
            <mesh position={[0, 1.3, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.2, 2.2, 12]} />
              <meshPhysicalMaterial
                color={DARK}
                roughness={0.5}
                clearcoat={0.3}
              />
            </mesh>
            {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
              <group
                key={angle}
                position={[
                  Math.cos(angle) * 1.3,
                  0.55 + i * 0.05,
                  Math.sin(angle) * 1.3,
                ]}
                rotation={[0, -angle, Math.PI / 2]}
              >
                <mesh castShadow>
                  <capsuleGeometry args={[0.4, 0.68, 8, 16]} />
                  <meshPhysicalMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity * 0.8}
                    roughness={0.15}
                    clearcoat={0.8}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {shape === "archive-tower" && (
          <>
            {/* Grand base — a real entrance hall with columns, wider than
                the shaft above it, instead of the tower rising bare from
                the shared foundation */}
            <FacadeBox size={[1.95, 0.95, 1.95]} y={0.48} color={color} />
            <Columns
              count={7}
              radius={1.2}
              y={0.48}
              height={0.95}
              color={color}
            />
            <Door z={1.02} width={0.65} />

            {/* Tower shaft, tiered upward in two steps for real silhouette
                instead of one flat box jumping straight to the roof */}
            <FacadeBox size={[1.5, 1.65, 1.5]} y={1.75} color={color} />
            <FacadeBox size={[1.18, 0.72, 1.18]} y={2.92} color={color} />

            <PyramidRoof
              size={0.92}
              height={0.75}
              y={3.65}
              color={color}
              emissiveIntensity={emissiveIntensity}
            />

            {/* Finial spire above the roof */}
            <mesh position={[0, 4.05, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.05, 0.5, 8]} />
              <meshStandardMaterial
                color={color}
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0, 4.32, 0]}>
              <sphereGeometry args={[0.06, 12, 10]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity * 1.4}
                toneMapped={false}
              />
            </mesh>

            {/* Floating dream-orb cluster — the lore's "vast library of
                glowing crystal balls," ringing the tower at varied heights
                instead of three balls in a flat row by the door. Radii are
                keyed to the actual shaft cross-section at each orb's height
                (0.6 half-width below y=2.5, 0.475 above it) plus a small
                ~0.15-0.2 clearance — orbs hug the tower surface instead of
                floating in open air with a visible gap to the facade. */}
            {[
              { a: 0, r: 0.95, y: 1.55 },
              { a: 1.4, r: 0.92, y: 2.35 },
              { a: 2.8, r: 0.8, y: 3.05 },
              { a: 4.2, r: 0.88, y: 1.85 },
              { a: 5.5, r: 0.76, y: 2.65 },
            ].map((orb) => (
              <mesh
                key={orb.a}
                position={[
                  Math.cos(orb.a) * orb.r,
                  orb.y,
                  Math.sin(orb.a) * orb.r,
                ]}
                castShadow
              >
                <sphereGeometry args={[0.13, 14, 12]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={emissiveIntensity * 1.2}
                  roughness={0.05}
                  clearcoat={1}
                  transmission={0.4}
                />
              </mesh>
            ))}
          </>
        )}

        {shape === "capitol" && (
          // A stepped tribunal platform capped by a tall authority spire —
          // deliberately NOT the drum+colonnade+dome pattern museum uses.
          // That shared pattern (with just the radii nudged) made Council
          // and Memory Hall read as the same building recolored. This is
          // the citizens'-vote assembly-steps silhouette instead: bears
          // climb three tiers to a central obelisk, not a rotunda dome.
          <>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.75, 1.92, 0.38, 8]} />
              <meshPhysicalMaterial
                color={DARK}
                roughness={0.5}
                clearcoat={0.3}
              />
            </mesh>
            <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.35, 1.52, 0.38, 8]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.4}
                clearcoat={0.4}
              />
            </mesh>
            <mesh position={[0, 1.22, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.95, 1.12, 0.38, 8]} />
              <meshPhysicalMaterial
                color={DARK}
                roughness={0.4}
                clearcoat={0.4}
              />
            </mesh>
            <Door z={1.95} width={0.65} />

            {/* Central authority spire — a verdict obelisk in place of a
                dome, the clearest single silhouette difference from Memory
                Hall's rotunda */}
            <mesh position={[0, 2.3, 0]} castShadow>
              <cylinderGeometry args={[0.28, 0.38, 1.6, 4]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.3}
                clearcoat={0.5}
              />
            </mesh>
            <mesh position={[0, 3.25, 0]} castShadow>
              <coneGeometry args={[0.35, 0.5, 4]} />
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity}
                roughness={0.2}
                clearcoat={0.6}
              />
            </mesh>

            {/* Flanking banner pylons — a council chamber's flags, not
                columns, so the front elevation reads distinctly from the
                museum's colonnade too */}
            {[-1.75, 1.75].map((x) => (
              <group key={x} position={[x, 0, 1.15]}>
                <mesh position={[0, 1.1, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.06, 2.2, 8]} />
                  <meshStandardMaterial color={DARK} roughness={0.5} />
                </mesh>
                <mesh position={[x > 0 ? -0.26 : 0.26, 1.85, 0]} castShadow>
                  <planeGeometry args={[0.52, 0.7]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity * 0.7}
                    roughness={0.6}
                    side={2}
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {shape === "greenhouse" && (
          <>
            <mesh position={[0, 0.98, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.18, 1.3, 1.05, 32]} />
              <meshPhysicalMaterial
                color={DARK}
                roughness={0.45}
                clearcoat={0.4}
              />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry
                args={[1.22, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshPhysicalMaterial
                color={color}
                emissive="#8fd9a8"
                emissiveIntensity={emissiveIntensity * 0.5}
                roughness={0.1}
                metalness={0.05}
                clearcoat={0.9}
                clearcoatRoughness={0.1}
                transmission={0.3}
              />
            </mesh>
            {[0.42, 0.72, 0.98].map((r) => (
              <mesh
                key={r}
                position={[0, 1.5, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[r, 0.018, 8, 32]} />
                <meshStandardMaterial color={DARK} roughness={0.5} />
              </mesh>
            ))}
          </>
        )}

        {shape === "cave" && (
          // Stretched 1.3x along X only — the archway, hillside, stalactites
          // and moss all elongate together into a wider, more horizontal
          // cave mouth instead of the original circular-arch proportions.
          // Kept modest: the widest element (a hillside rock cluster at
          // local x=1.15, radius 0.85) already reaches ~6 world units at
          // 1x: a bigger stretch pushes it uncomfortably close to a
          // neighboring landmark's own clearance.
          <group scale={[1.3, 1, 1]}>
            {/*
             * A real stone ARCHWAY you see straight through — the previous
             * version was a boulder pile with a flat dark circle painted on
             * top, which only read as a "mouth" from head-on and looked
             * like a decal from any other angle. torusGeometry's default
             * orientation already lies in the XY plane (facing +Z, matching
             * every other landmark's forward-door convention) — sweeping
             * only its upper half (arc=PI) traces legs-planted-in-the-
             * ground-to-peaked-top archway with a genuinely empty center,
             * so the sky/interior shows through instead of being faked.
             */}
            <mesh castShadow receiveShadow>
              <torusGeometry args={[1.2, 0.32, 7, 20, Math.PI]} />
              <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
            </mesh>

            {/* Chunky rock clusters riding the arch's curve, breaking up
                the smooth torus silhouette into jagged natural stone */}
            {[
              0.15,
              Math.PI * 0.32,
              Math.PI * 0.5,
              Math.PI * 0.68,
              Math.PI - 0.15,
            ].map((angle) => (
              <mesh
                key={angle}
                position={[Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0]}
                rotation={[angle, angle * 0.6, 0]}
                castShadow
              >
                <icosahedronGeometry args={[0.36, 0]} />
                <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
              </mesh>
            ))}

            {/* Tunnel shell — a real hollow rock tube running back from the
                archway, the same "legs planted in the ground to a peaked
                top" half-circle cross-section (arc=PI) as the archway so
                it reads as a continuation of the entrance, not a
                mismatched pipe. Replaces the old flat dark circle that
                only faked depth from straight ahead. */}
            <mesh
              position={[0, 0, -1.5]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[1.05, 1.05, 3, 16, 1, true, 0, Math.PI]} />
              <meshStandardMaterial
                color={STONE_DARK}
                roughness={0.95}
                side={2}
                flatShading
              />
            </mesh>

            {/* Back wall — closes the tunnel into a real enclosed room
                instead of an open pipe to nowhere, so the cave reads as
                somewhere bears could actually sit inside */}
            {[
              [0, 1.15, -2.95] as const,
              [0.55, 0.5, -2.9] as const,
              [-0.55, 0.5, -2.9] as const,
              [0, 0.35, -2.95] as const,
            ].map((pos) => (
              <mesh
                key={`backwall-${pos.join("-")}`}
                position={pos}
                castShadow
                receiveShadow
              >
                <icosahedronGeometry args={[0.72, 0]} />
                <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
              </mesh>
            ))}

            {/* Cave floor — packed earth running the full length of the
                tunnel, real footing for the lore's bears pondering
                existence instead of an empty void inside the archway */}
            <mesh position={[0, 0.03, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.9, 3]} />
              <meshStandardMaterial color="#3a3226" roughness={0.95} />
            </mesh>

            {/* Hillside the archway is carved through — mass to the sides
                and above the opening, extended back to cover the tunnel
                shell's exterior so it reads as a real hill, not a
                floating tube, while never blocking the entrance gap */}
            {[
              { pos: [1.35, 0.55, -0.6] as const, r: 1.0 },
              { pos: [-1.35, 0.55, -0.6] as const, r: 1.0 },
              { pos: [0.7, 1.7, -0.7] as const, r: 0.94 },
              { pos: [-0.7, 1.7, -0.7] as const, r: 0.94 },
              { pos: [0, 2.1, -0.8] as const, r: 0.88 },
              { pos: [1.2, 0.6, -1.8] as const, r: 0.95 },
              { pos: [-1.2, 0.6, -1.8] as const, r: 0.95 },
              { pos: [0.55, 1.55, -2.0] as const, r: 0.85 },
              { pos: [-0.55, 1.55, -2.0] as const, r: 0.85 },
              { pos: [0, 1.9, -2.3] as const, r: 0.8 },
            ].map((rock) => (
              <mesh
                key={rock.pos.join("-")}
                position={rock.pos}
                castShadow
                receiveShadow
              >
                <icosahedronGeometry args={[rock.r, 0]} />
                <meshStandardMaterial
                  color={STONE_DARK}
                  roughness={0.95}
                  flatShading
                />
              </mesh>
            ))}

            {/* Stalactites hanging from the underside of the arch */}
            {[0.35, Math.PI * 0.5, Math.PI - 0.35].map((angle) => (
              <mesh
                key={`stalactite-${angle}`}
                position={[
                  Math.cos(angle) * 0.98,
                  Math.sin(angle) * 0.98 - 0.05,
                  0,
                ]}
                rotation={[Math.PI, 0, 0]}
                castShadow
              >
                <coneGeometry args={[0.07, 0.26, 6]} />
                <meshStandardMaterial color={STONE_DARK} roughness={0.9} flatShading />
              </mesh>
            ))}

            {/* Moss patches at the base, selling the lore's "soft moss" */}
            {[
              [0.85, 0.12, 0.3],
              [-0.85, 0.12, 0.3],
              [0.4, 0.1, 0.55],
            ].map(([x, y, z]) => (
              <mesh key={`moss-${x}`} position={[x, y, z]} scale={[1, 0.4, 1]}>
                <icosahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial
                  color="#4a7c4a"
                  roughness={0.9}
                  flatShading
                />
              </mesh>
            ))}

            {/* Warm interior glow — bright enough to light the tunnel floor
                and back wall so the enclosed room actually reads as
                occupied space from the entrance, not a dark void */}
            <mesh position={[0, 0.45, -1.9]}>
              <sphereGeometry args={[0.34, 14, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity * 2.4}
                toneMapped={false}
              />
            </mesh>
            <pointLight
              position={[0, 0.6, -1.9]}
              color={color}
              intensity={3.5}
              distance={3.5}
              decay={2}
            />

            {/* Dripping water — a thin glowing trickle from the keystone */}
            <mesh position={[0.1, 1.05, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.45, 6]} />
              <meshStandardMaterial
                color="#8fd0e8"
                emissive="#8fd0e8"
                emissiveIntensity={0.6}
                transparent
                opacity={0.55}
                toneMapped={false}
              />
            </mesh>

            {/* A resting bear, sheltered inside on the new floor — a
                first decorative step toward "bears sit/sleep here". Real
                sit/sleep/dance animation would need new pose states in
                CityBear.tsx's walk-cycle rig (used by the wandering NPC
                bears) — that's a separate, larger feature; this is a
                static prop local to this landmark only. */}
            <group position={[-0.35, 0.03, -1.9]} rotation={[0, 0.6, 0]}>
              <mesh position={[0, 0.2, 0]} scale={[1, 0.75, 1.2]} castShadow>
                <sphereGeometry args={[0.24, 16, 12]} />
                <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.38, 0.22]} castShadow>
                <sphereGeometry args={[0.15, 16, 12]} />
                <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
              </mesh>
              {[-0.08, 0.08].map((ex) => (
                <mesh key={ex} position={[ex, 0.49, 0.2]} castShadow>
                  <sphereGeometry args={[0.045, 10, 8]} />
                  <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
                </mesh>
              ))}
            </group>
          </group>
        )}

        {shape === "market" && (
          <>
            {/* Ground floor — wide windowed anchor footprint, a real mall
                base instead of a single squat block */}
            <FacadeBox size={[2.4, 1.7, 1.8]} y={0.85} color={color} />

            {/* Upper floor — set back and narrower, giving the mall a real
                stepped multi-story silhouette */}
            <FacadeBox size={[1.9, 1.1, 1.4]} y={2.25} color={color} />

            {/* Glass atrium skylight — the signature "shopping mall" roof cue */}
            <mesh
              position={[0, 3.25, 0]}
              rotation={[0, Math.PI / 4, 0]}
              castShadow
            >
              <coneGeometry args={[1.5, 0.9, 4]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.1}
                metalness={0.1}
                clearcoat={0.9}
                transmission={0.35}
                emissive={color}
                emissiveIntensity={emissiveIntensity * 0.5}
              />
            </mesh>

            {/* Big illuminated marquee sign band between the two floors */}
            <mesh position={[0, 1.95, 0.95]} castShadow>
              <boxGeometry args={[1.9, 0.4, 0.1]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveIntensity * 1.4}
                toneMapped={false}
              />
            </mesh>

            {/* Big entry gate — tall pillars and a lit archway matching the
                bigger body, the mall's actual "walk through here" front door */}
            <group position={[0, 0, 1]}>
              {[-0.85, 0.85].map((x) => (
                <mesh key={x} position={[x, 0.9, 0]} castShadow>
                  <boxGeometry args={[0.22, 1.8, 0.22]} />
                  <meshPhysicalMaterial
                    color={DARK}
                    roughness={0.4}
                    clearcoat={0.4}
                  />
                </mesh>
              ))}
              <mesh position={[0, 1.84, 0]} castShadow>
                <boxGeometry args={[1.85, 0.2, 0.24]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={emissiveIntensity}
                  toneMapped={false}
                />
              </mesh>
              <Door z={0.02} width={1} />
            </group>

            <MarketStalls color={color} emissiveIntensity={emissiveIntensity} />
          </>
        )}

        {shape === "park" && (
          <>
            {/* Lawn — a grass-green disc, the park's defining ground
                surface in place of a stadium's running track */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <circleGeometry args={[2.4, 40]} />
              <meshStandardMaterial color="#4a8a4f" roughness={0.85} />
            </mesh>

            {/* Walking path looping the lawn */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
              <ringGeometry args={[1.7, 2.0, 40]} />
              <meshStandardMaterial color="#c9b28a" roughness={0.9} />
            </mesh>

            {/* "Flying stars" — fireflies drifting over the lawn at night */}
            <Sparkles
              count={60}
              scale={[4.2, 2, 4.2]}
              size={3.6}
              speed={0.3}
              opacity={0.75}
              color="#fff6d8"
              position={[0, 0.9, 0]}
            />

            {/* Many real trees scattered across the lawn */}
            {[
              { pos: [0.85, 0, 0.68] as const, s: 1.3 },
              { pos: [-1.0, 0, 0.48] as const, s: 1.15 },
              { pos: [0.75, 0, -1.35] as const, s: 1.35 },
              { pos: [-0.85, 0, -0.95] as const, s: 1.2 },
              { pos: [1.25, 0, -0.2] as const, s: 1.1 },
              { pos: [-1.35, 0, -0.4] as const, s: 1.4 },
              { pos: [0.3, 0, 1.45] as const, s: 1.0 },
              { pos: [-0.45, 0, 1.5] as const, s: 1.15 },
              { pos: [1.4, 0, 0.75] as const, s: 1.25 },
            ].map((tree) => (
              <group key={tree.pos.join("-")} position={tree.pos} scale={tree.s}>
                <mesh position={[0, 0.25, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.09, 0.55, 8]} />
                  <meshStandardMaterial color="#5a4632" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.66, 0]} castShadow>
                  <icosahedronGeometry args={[0.4, 1]} />
                  <meshStandardMaterial
                    color="#3f7a44"
                    roughness={0.75}
                    flatShading
                  />
                </mesh>
                <mesh position={[0.19, 0.84, 0.12]} castShadow>
                  <icosahedronGeometry args={[0.25, 1]} />
                  <meshStandardMaterial
                    color="#4a9350"
                    roughness={0.75}
                    flatShading
                  />
                </mesh>
              </group>
            ))}

            {/* Wall of Honor — a small monument slab keeping the lore's
                "every participant earns a badge" detail alive in park
                form, now a plaque wall rather than stadium signage */}
            <group position={[0, 0, -1.55]}>
              <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.4, 1.05, 0.14]} />
                <meshPhysicalMaterial color={DARK} roughness={0.5} clearcoat={0.4} />
              </mesh>
              {Array.from({ length: 6 }, (_, i) => (
                <mesh
                  key={`badge-${i}`}
                  position={[
                    -0.48 + (i % 3) * 0.48,
                    0.75 - Math.floor(i / 3) * 0.42,
                    0.1,
                  ]}
                >
                  <circleGeometry args={[0.11, 16]} />
                  <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>

            {/* Lamp posts flanking the path entrance */}
            {[-1.3, 1.3].map((x) => (
              <group key={x} position={[x, 0, 1.4]}>
                <mesh position={[0, 0.58, 0]} castShadow>
                  <cylinderGeometry args={[0.038, 0.045, 1.15, 8]} />
                  <meshStandardMaterial
                    color="#2a2f42"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                <mesh position={[0, 1.2, 0]}>
                  <sphereGeometry args={[0.1, 12, 10]} />
                  <meshStandardMaterial
                    color={WINDOW_COLOR}
                    emissive={WINDOW_COLOR}
                    emissiveIntensity={1.1}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            ))}

            {/* A small glowing river winding along the back edge of the
                lawn, behind the Wall of Honor — same glowing-water
                technique as Salmon Stream, just a gentler park brook */}
            {[
              [-1.5, 0, -2.0],
              [-0.55, 0, -2.18],
              [0.5, 0, -2.12],
              [1.45, 0, -1.9],
            ].map(([x, , z]) => (
              <mesh
                key={`park-river-${x}-${z}`}
                position={[x, 0.07, z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[0.42, 16]} />
                <meshStandardMaterial
                  color="#6fb8e0"
                  emissive="#6fb8e0"
                  emissiveIntensity={0.7}
                  toneMapped={false}
                  transparent
                  opacity={0.65}
                />
              </mesh>
            ))}
          </>
        )}

        {shape === "distillery" && (
          <>
            {[
              { x: 0, h: 1.9, r: 0.54 },
              { x: -0.92, h: 1.4, r: 0.42 },
              { x: 0.92, h: 1.6, r: 0.42 },
            ].map((tank) => (
              <group key={tank.x}>
                <mesh
                  position={[tank.x, tank.h / 2 + 0.1, 0]}
                  castShadow
                  receiveShadow
                >
                  <cylinderGeometry args={[tank.r, tank.r, tank.h, 20]} />
                  <meshPhysicalMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.4}
                    clearcoat={0.6}
                  />
                </mesh>
                <mesh position={[tank.x, tank.h + 0.1, 0]} castShadow>
                  <coneGeometry args={[tank.r, 0.3, 20]} />
                  <meshPhysicalMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.4}
                  />
                </mesh>
                <mesh position={[tank.x, tank.h * 0.4, tank.r + 0.01]}>
                  <circleGeometry args={[0.08, 12]} />
                  <meshStandardMaterial
                    color={WINDOW_COLOR}
                    emissive={WINDOW_COLOR}
                    emissiveIntensity={1.2}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            ))}
            <mesh position={[-0.5, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.84, 8]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0.5, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.84, 8]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.4}
              />
            </mesh>
          </>
        )}

        {shape === "weather-tower" && (
          <>
            <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.42, 2.6, 16]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.3}
                metalness={0.35}
                clearcoat={0.6}
              />
            </mesh>
            <mesh position={[0, 2.55, 0]} castShadow>
              <cylinderGeometry args={[0.95, 0.95, 0.18, 24]} />
              <meshPhysicalMaterial
                color={color}
                roughness={0.35}
                clearcoat={0.5}
              />
            </mesh>
            {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => (
              <mesh
                key={angle}
                position={[
                  Math.cos(angle) * 0.56,
                  2.55,
                  Math.sin(angle) * 0.56,
                ]}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
                <meshStandardMaterial
                  color={WINDOW_COLOR}
                  emissive={WINDOW_COLOR}
                  emissiveIntensity={0.9}
                  toneMapped={false}
                  roughness={0.4}
                />
              </mesh>
            ))}
            <mesh position={[0, 2.85, 0]} rotation={[Math.PI / 3, 0, 0]}>
              <cylinderGeometry
                args={[0.4, 0.4, 0.07, 20, 1, true, 0, Math.PI]}
              />
              <meshPhysicalMaterial
                color={color}
                roughness={0.25}
                metalness={0.4}
                side={2}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}
