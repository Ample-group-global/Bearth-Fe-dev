"use client";

import { useMemo } from "react";

const STONE = "#4d473d";
const STONE_DARK = "#39352e";

/**
 * Grounds Bearth City's "floating city" premise in a literal shape: the
 * reflective plaza floor (CityEnvironment) now reads as the TOP of a
 * chunky floating island rather than an infinite flat plane — this adds
 * the rocky underside hanging below the edge, a ring of mountains beyond
 * the skyline breaking the horizon, and trees scattered in the open band
 * between the landmark ring (radius ~21-52) and the skyline (radius 69+).
 * Deliberately keeps the existing stars/drift/ice-sheet-below premise —
 * this is a floating island, not a grounded one.
 */

/** Hangs directly below the cliff edge — close enough (radius ~58-68) to
 * actually be seen from a normal orbit angle, not a distant detail only
 * visible at max zoom-out. */
function IslandUnderside() {
  const rocks = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; r: number }> = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.12;
      const radius = 56 + (i % 4) * 4;
      const depth = -4 - (i % 6) * 3;
      list.push({
        pos: [Math.cos(angle) * radius, depth, Math.sin(angle) * radius],
        r: 5.5 + (i % 3) * 2.4,
      });
    }
    return list;
  }, []);

  return (
    <>
      {rocks.map((rock) => (
        <mesh key={rock.pos.join("-")} position={rock.pos} receiveShadow>
          <icosahedronGeometry args={[rock.r, 0]} />
          <meshStandardMaterial color={STONE_DARK} roughness={0.95} flatShading />
        </mesh>
      ))}
    </>
  );
}

/** The cliff lip right at the main plaza floor's edge (radius 66) — this
 * is the feature that actually has to be visible in ordinary framing for
 * the city to read as sitting on an island at all, not scenery reserved
 * for max zoom-out. */
function IslandEdgeRim() {
  const rocks = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; r: number }> = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 64 + (i % 3) * 2.5;
      list.push({
        pos: [Math.cos(angle) * radius, -0.4 + (i % 3) * 0.5, Math.sin(angle) * radius],
        r: 3 + (i % 4) * 1.1,
      });
    }
    return list;
  }, []);

  return (
    <>
      {rocks.map((rock) => (
        <mesh key={rock.pos.join("-")} position={rock.pos} castShadow receiveShadow>
          <icosahedronGeometry args={[rock.r, 0]} />
          <meshStandardMaterial color={STONE} roughness={0.95} flatShading />
        </mesh>
      ))}
    </>
  );
}

/** A rougher outer terrace beyond the main plaza's cliff edge, holding
 * the background skyline (whose buildings sit at y=0, same as the main
 * plaza — no vertical step here, just a material change) so the skyline
 * doesn't appear to float past the cliff with no ground under it. The
 * IslandEdgeRim's jagged rocks are what actually sell the "edge" here,
 * not a height drop. */
function IslandLowerTerrace() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <ringGeometry args={[63, 98, 72]} />
      <meshStandardMaterial color="#171f38" roughness={0.9} side={2} />
    </mesh>
  );
}

/**
 * A proper mountain: a jagged rock-cluster base (irregular icosahedra, not
 * a clean cone) rising into a tall central peak plus 2 shorter shoulder
 * peaks — a real ridge silhouette instead of a single smooth cone with a
 * hat. Bulkier proportions (wide base relative to height) read as a real
 * mountain mass rather than a party hat.
 */
function Mountain({
  x,
  z,
  height,
}: {
  x: number;
  z: number;
  height: number;
}) {
  // Position-radius and rock-radius fractions were originally sized so a
  // tall mountain's base rocks reached OVER 100% of its own height out
  // from center (e.g. ~68 units for a 58-unit peak) — the rocks, not the
  // cone, were the real footprint, and it grew unboundedly with height.
  // Kept tight here (max combined reach ~0.52x height) so a mountain's
  // footprint stays proportionate regardless of how tall it is.
  const baseRocks = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; r: number }> = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = height * (0.28 + (i % 3) * 0.04);
      list.push({
        pos: [
          Math.cos(angle) * r,
          height * (0.06 + (i % 3) * 0.03),
          Math.sin(angle) * r,
        ],
        r: height * (0.1 + (i % 4) * 0.02),
      });
    }
    return list;
  }, [height]);

  return (
    <group position={[x, 0, z]}>
      {baseRocks.map((rock) => (
        <mesh key={rock.pos.join("-")} position={rock.pos} castShadow receiveShadow>
          <icosahedronGeometry args={[rock.r, 0]} />
          <meshStandardMaterial color={STONE_DARK} roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* Central peak */}
      <mesh position={[0, height * 0.46, 0]} castShadow receiveShadow>
        <coneGeometry args={[height * 0.42, height * 0.92, 8]} />
        <meshStandardMaterial color={STONE} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, height * 0.86, 0]} castShadow>
        <coneGeometry args={[height * 0.12, height * 0.28, 8]} />
        <meshStandardMaterial color="#e8edf5" roughness={0.6} />
      </mesh>

      {/* Two shorter shoulder peaks flanking the main one */}
      {[
        { dx: height * 0.26, dz: height * 0.11, h: 0.68 },
        { dx: -height * 0.24, dz: -height * 0.13, h: 0.6 },
      ].map((shoulder) => (
        <group key={shoulder.dx} position={[shoulder.dx, 0, shoulder.dz]}>
          <mesh
            position={[0, height * shoulder.h * 0.5, 0]}
            castShadow
            receiveShadow
          >
            <coneGeometry
              args={[height * shoulder.h * 0.38, height * shoulder.h * 0.85, 7]}
            />
            <meshStandardMaterial color={STONE_DARK} roughness={0.92} flatShading />
          </mesh>
          <mesh position={[0, height * shoulder.h * 0.88, 0]} castShadow>
            <coneGeometry
              args={[height * shoulder.h * 0.11, height * shoulder.h * 0.22, 7]}
            />
            <meshStandardMaterial color="#e8edf5" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function IslandMountains() {
  const peaks = useMemo(
    () => [
      { angle: 1.05, radius: 102, height: 46 },
      { angle: 4.2, radius: 106, height: 52 },
    ],
    [],
  );

  return (
    <>
      {peaks.map((peak) => (
        <Mountain
          key={peak.angle}
          x={Math.cos(peak.angle) * peak.radius}
          z={Math.sin(peak.angle) * peak.radius}
          height={peak.height}
        />
      ))}
    </>
  );
}

/** A fuller, leafier canopy — a cluster of overlapping foliage clumps in
 * varied greens instead of two bare icosahedra, so it reads as leaves
 * rather than a smooth rock-like blob. */
const CANOPY_CLUMPS: Array<{
  pos: [number, number, number];
  r: number;
  color: string;
}> = [
  { pos: [0, 0, 0], r: 1.35, color: "#3f7a44" },
  { pos: [0.75, 0.35, 0.3], r: 0.95, color: "#4a9350" },
  { pos: [-0.7, 0.3, -0.35], r: 0.9, color: "#428a49" },
  { pos: [0.25, 0.6, -0.7], r: 0.85, color: "#4a9350" },
  { pos: [-0.3, 0.7, 0.65], r: 0.8, color: "#57a25c" },
  { pos: [0, 1.0, 0], r: 0.75, color: "#57a25c" },
];

function IslandTrees() {
  const trees = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; s: number }> = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + 0.35;
      const radius = 55 + (i % 3) * 4;
      list.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        s: 1.7 + (i % 3) * 0.5,
      });
    }
    return list;
  }, []);

  return (
    <>
      {trees.map((tree) => (
        <group key={tree.pos.join("-")} position={tree.pos} scale={tree.s}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.28, 1.6, 8]} />
            <meshStandardMaterial color="#5a4632" roughness={0.8} />
          </mesh>
          <group position={[0, 1.9, 0]}>
            {CANOPY_CLUMPS.map((clump) => (
              <mesh key={clump.pos.join("-")} position={clump.pos} castShadow>
                <icosahedronGeometry args={[clump.r, 1]} />
                <meshStandardMaterial
                  color={clump.color}
                  roughness={0.75}
                  flatShading
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </>
  );
}

export default function CityIsland() {
  return (
    <>
      <IslandUnderside />
      <IslandEdgeRim />
      <IslandLowerTerrace />
      <IslandMountains />
      <IslandTrees />
    </>
  );
}
