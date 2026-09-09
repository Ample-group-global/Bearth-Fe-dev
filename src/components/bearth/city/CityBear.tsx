"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { cityPortals } from "./city-portals.config";

export type BearHold = "none" | "fish" | "star" | "berry" | "mug" | "shirt";
export type EarStyle = "round" | "pointy" | "long" | "tiny";
export type BearAccessory = "none" | "cap" | "bandana" | "bow" | "backpack";
/** Hand/paw silhouette — paw (most bears), flipper (Seal/Penguin), wing (Owl). */
export type HandShape = "paw" | "flipper" | "wing";
/** Tail silhouette behind the body — none (most bears read tail-less in the
 * brand art), fluffy (Fox/Luna), pompom (Rabbit/Deer). */
export type TailStyle = "none" | "fluffy" | "pompom";

interface CityBearProps {
  /** Character name (Bear, Luna, Panda, Fox, ...) — informational, not
   * rendered in-scene (a moving bear has nowhere to ground a physical
   * sign the way a landmark's hoarding can). */
  name?: string;
  /** XZ waypoints the bear patrols in a loop — real point-to-point walking across the whole city. */
  waypoints: Array<[number, number]>;
  speed?: number;
  phaseOffset?: number;
  color?: string;
  hold?: BearHold;
  /** Overall size — real variety between bears, not just a color swap. */
  bodyScale?: number;
  /** Ear size relative to the head — a second axis of real difference. */
  earScale?: number;
  /** Ear silhouette — round (bear/panda), pointy (fox/deer), long (rabbit), tiny (seal/penguin). */
  earStyle?: EarStyle;
  /** Head size relative to the body — Panda/Owl read bigger-headed, Fox/Deer leaner. */
  headScale?: number;
  /** Face-patch size — the lighter muzzle/belly-tone circle on the face. */
  snoutScale?: number;
  /** Belly/face patch tone — the brand bears' signature two-tone coloring. */
  muzzleColor?: string;
  /** Worn item — cap, bandana, bow, or a little backpack — for real per-bear variety. */
  accessory?: BearAccessory;
  /** Accent color for the worn accessory. */
  accessoryColor?: string;
  /** Hand/paw silhouette — real anatomy variety per species, not just a
   * color swap on the same round paw for everyone. */
  handShape?: HandShape;
  /** Tail silhouette behind the body. */
  tailStyle?: TailStyle;
  /** Branching antlers on the head — Deer only. */
  hasAntlers?: boolean;
  /** Small pointed beak instead of a round nose — Penguin/Owl. */
  hasBeak?: boolean;
  /** This bear's slot in the shared position registry — see CityBears.tsx. */
  index?: number;
  /** Every bear's last rendered (x, z), flat-packed — used to nudge apart from neighbors. */
  sharedPositions?: Float32Array;
}

const SEPARATION_RADIUS = 2.3;
const SEPARATION_STRENGTH = 0.9;

/**
 * Every landmark's real footprint isn't just its hitbox cylinder (radius
 * 4.4) — CityPortal.tsx also plants a physical Hoarding sign off to one
 * side, at a fixed local offset of [5.2, 4.2] rotated -0.6 rad, with a
 * 4.4-wide board. That sign's near edge sits ~4.5 units from the landmark
 * center and its far edge ~8.9 units out along that same ~38° heading — so
 * a circle centered on the landmark alone can't cover it without being
 * wastefully huge in every other direction.
 *
 * Instead this is the tight minimal-enclosing-circle for "hitbox disk ∪
 * hoarding board", nudged toward the hoarding's heading (offset [1.8, 1.4])
 * with just enough radius (8) to cover both plus a bear's own rendered
 * half-width (~1.1) and a small safety margin — one shared shape since
 * every landmark places its hoarding at this same relative offset.
 */
const LANDMARK_EXCLUSION_OFFSET: [number, number] = [1.8, 1.4];
const LANDMARK_EXCLUSION_RADIUS = 8;
const LANDMARK_EXCLUSIONS: Array<{ x: number; z: number }> = cityPortals.map(
  (portal) => ({
    x: portal.position[0] + LANDMARK_EXCLUSION_OFFSET[0],
    z: portal.position[2] + LANDMARK_EXCLUSION_OFFSET[1],
  }),
);

/**
 * Small held prop — a nod to the real NFT "Holding" trait layer. Rendered
 * as a child of the holding arm's pivot group (not the torso), so positions
 * here are local to that pivot — the prop rides the arm through its raise/
 * toast/reel gesture instead of floating in place while the arm moves.
 */
function HeldItem({ hold }: { hold: BearHold }) {
  if (hold === "fish") {
    return (
      <group position={[0.32, -0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <capsuleGeometry args={[0.05, 0.14, 4, 8]} />
          <meshStandardMaterial color="#5fb3c9" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.11, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.05, 0.07, 4]} />
          <meshStandardMaterial color="#5fb3c9" roughness={0.4} />
        </mesh>
      </group>
    );
  }

  if (hold === "star") {
    return (
      <mesh position={[0.3, 0, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial
          color="#f0d68a"
          emissive="#f0d68a"
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>
    );
  }

  if (hold === "berry") {
    return (
      <group position={[0.3, -0.03, 0]}>
        {[
          [0, 0, 0],
          [0.05, 0.04, 0],
          [-0.02, 0.05, 0.03],
        ].map(([x, y, z]) => (
          <mesh key={`${x}-${y}-${z}`} position={[x, y, z]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#c4415a" roughness={0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  if (hold === "mug") {
    return (
      <mesh position={[0.3, -0.03, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.09, 10]} />
        <meshStandardMaterial
          color="#e8c88a"
          emissive="#e8c88a"
          emissiveIntensity={0.4}
          roughness={0.4}
        />
      </mesh>
    );
  }

  if (hold === "shirt") {
    // A folded branded T-shirt held up for display — the market vendor's
    // merch. Body plus two small sleeve tabs, with a light collar dot
    // standing in for a printed logo.
    return (
      <group position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.02, 0.14]} />
          <meshStandardMaterial color="#41afeb" roughness={0.6} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.11, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.02, 0.06]} />
            <meshStandardMaterial color="#41afeb" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 0.012, 0]}>
          <circleGeometry args={[0.02, 8]} />
          <meshStandardMaterial color="#ebe7e0" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  return null;
}

/** Ear silhouette varies per bear type — round/pointy/long/tiny, not a uniform sphere for everyone. */
function Ears({
  style,
  radius,
  color,
  headScale = 1,
}: {
  style: EarStyle;
  radius: number;
  color: string;
  headScale?: number;
}) {
  // Relative to the head group's origin (the head sphere's center).
  const positions: Array<[number, number, number]> = [
    [0.1 * headScale, 0.19 * headScale, 0.14 * headScale],
    [0.1 * headScale, 0.19 * headScale, -0.14 * headScale],
  ];

  if (style === "pointy") {
    return (
      <>
        {positions.map(([x, y, z]) => (
          <mesh
            key={z}
            position={[x, y, z]}
            rotation={[Math.PI, 0, 0]}
            castShadow
          >
            <coneGeometry args={[radius * 1.1, radius * 2.2, 8]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        ))}
      </>
    );
  }

  if (style === "long") {
    return (
      <>
        {positions.map(([x, y, z]) => (
          <mesh
            key={z}
            position={[x, y + radius * 1.4, z * 0.75]}
            rotation={[0, 0, z > 0 ? -0.15 : 0.15]}
            castShadow
          >
            <capsuleGeometry args={[radius * 0.55, radius * 2.6, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        ))}
      </>
    );
  }

  return (
    <>
      {positions.map(([x, y, z]) => (
        <mesh key={z} position={[x, y, z]} castShadow>
          <sphereGeometry args={[radius, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
    </>
  );
}

/** Tail behind the body — most bears go tail-less (matches the flat brand
 * art), but Fox/Luna's fluffy tail and Rabbit/Deer's small pompom tail are
 * too species-defining to skip. Positioned inside bodyRef so it rides the
 * walk bob/roll naturally instead of floating fixed in world space. */
function Tail({
  style,
  color,
  accentColor,
}: {
  style: TailStyle;
  color: string;
  accentColor: string;
}) {
  if (style === "fluffy") {
    return (
      <group position={[-0.34, 0, 0]} rotation={[0, 0, 0.5]}>
        {[
          { pos: [0, 0, 0] as const, r: 0.16 },
          { pos: [-0.08, 0.1, 0] as const, r: 0.13 },
          { pos: [-0.14, 0.22, 0] as const, r: 0.1 },
        ].map((seg) => (
          <mesh key={seg.pos.join("-")} position={seg.pos} castShadow>
            <sphereGeometry args={[seg.r, 10, 8]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  if (style === "pompom") {
    return (
      <mesh position={[-0.32, -0.02, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color={accentColor} roughness={0.9} />
      </mesh>
    );
  }

  return null;
}

/** Branching antlers — Deer only. A short beam per side with two small
 * prongs, low-poly but unmistakably antler-shaped, not a bare cylinder. */
function Antlers({ color, headScale }: { color: string; headScale: number }) {
  const sides = [1, -1];
  return (
    <>
      {sides.map((side) => (
        <group
          key={side}
          position={[
            0.02 * headScale,
            0.24 * headScale,
            side * 0.11 * headScale,
          ]}
          rotation={[0, 0, side * -0.3]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.22 * headScale, 6]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          {[0.06, 0.13].map((h) => (
            <mesh
              key={h}
              position={[0.02, h, 0]}
              rotation={[0, 0, -0.7]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.015, 0.1 * headScale, 6]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/** Small pointed beak instead of a round nose — Penguin/Owl. */
function Beak({
  headScale,
  snoutScale,
}: {
  headScale: number;
  snoutScale: number;
}) {
  return (
    <mesh
      position={[0.34 * headScale * snoutScale, -0.02, 0]}
      rotation={[0, 0, -Math.PI / 2]}
      castShadow
    >
      <coneGeometry args={[0.035, 0.09, 8]} />
      <meshStandardMaterial color="#e8a23a" roughness={0.5} />
    </mesh>
  );
}

/** Worn accessory — cap, bandana, bow, or backpack — real per-bear "clothing" variety. */
function Accessory({
  type,
  color,
  headScale,
}: {
  type: BearAccessory;
  color: string;
  headScale: number;
}) {
  if (type === "cap") {
    return (
      <group position={[0.02 * headScale, 0.24 * headScale, 0]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <sphereGeometry
            args={[0.145 * headScale, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0.1 * headScale, -0.02 * headScale, 0]} castShadow>
          <cylinderGeometry
            args={[0.06 * headScale, 0.06 * headScale, 0.02 * headScale, 12]}
          />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      </group>
    );
  }

  if (type === "bandana") {
    // Sits at the base of the head sphere, right where the neck meets the
    // torso — this component is rendered inside the head group, so the
    // offset is head-relative, not the body-relative height a "0.62" would
    // imply (that reading floated the collar a full head-height too high).
    return (
      <mesh
        position={[0, -0.22 * headScale, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <torusGeometry args={[0.24 * headScale, 0.045 * headScale, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    );
  }

  if (type === "bow") {
    // A hair bow near the top of the head, same neighborhood as the cap —
    // not the neck-height offset it previously (incorrectly) shared with
    // the bandana math.
    return (
      <group
        position={[0, 0.24 * headScale, 0.16 * headScale]}
        scale={headScale}
      >
        <mesh rotation={[0, 0, Math.PI / 5]} castShadow>
          <coneGeometry args={[0.06, 0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 5]} castShadow>
          <coneGeometry args={[0.06, 0.1, 4]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      </group>
    );
  }

  return null;
}

/** Backpack — worn on the torso, not the head, so (unlike cap/bandana/bow)
 * this is rendered as a sibling of the head group directly inside bodyRef;
 * it shouldn't tip and swing with every head tilt during arrival gestures. */
function Backpack({ color }: { color: string }) {
  return (
    <mesh position={[-0.24, 0.35, 0]} castShadow>
      <boxGeometry args={[0.14, 0.22, 0.26]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

/** Dwell time at each end of a route — long enough that the arrival gesture
 * below is actually observable, not just a blink-and-you-miss-it beat
 * squeezed between long cross-city walks. */
const PAUSE_DURATION = 6;

interface PauseGesture {
  bodyBob: number;
  headTiltX: number;
  headYawY: number;
  holdArmZ: number;
  freeArmZ: number;
}

/** Real per-hold idle activity while paused at a landmark — a raised/toasting/
 * reeling arm pose plus head movement, not just a barely-visible body sway.
 * Each bear's hold item already reflects what it's doing there (fishing at
 * the stream, toasting at the distillery, stargazing near the Dream
 * Chamber, foraging near Energy Park) — this makes that action legible. */
function pauseGesture(hold: BearHold, phase: number): PauseGesture {
  switch (hold) {
    case "fish": {
      // Reel it in, hoist it up proudly, hold it there and admire the catch.
      const raise = Math.sin(Math.min(phase / 1.2, 1) * Math.PI * 0.5);
      const wobble = phase > 1.2 ? Math.sin((phase - 1.2) * 3) * 0.06 : 0;
      return {
        bodyBob: raise * 0.05,
        headTiltX: raise * 0.3 + wobble, // looks down at the raised catch
        headYawY: 0,
        holdArmZ: Math.PI * 0.6 * raise + wobble * 0.4,
        freeArmZ: 0,
      };
    }
    case "shirt": {
      // Market vendor's pitch — hold the shirt up, gentle side-to-side
      // "check this out" rock instead of a static display.
      const raise = Math.sin(Math.min(phase / 1, 1) * Math.PI * 0.5);
      const rock = Math.sin(phase * 1.6) * 0.15;
      return {
        bodyBob: 0,
        headTiltX: 0,
        headYawY: rock * 0.6,
        holdArmZ: Math.PI * 0.55 * raise + rock * 0.3,
        freeArmZ: -rock * 0.2,
      };
    }
    case "mug": {
      // Rhythmic toast — raise, tip back for a sip, lower, repeat.
      const cycle = (phase % 2.4) / 2.4;
      const raise = Math.sin(cycle * Math.PI);
      return {
        bodyBob: 0,
        headTiltX: -raise * 0.22, // head tips back mid-sip
        headYawY: 0,
        holdArmZ: Math.PI * 0.55 * raise,
        freeArmZ: 0,
      };
    }
    case "star": {
      // Slow stargazing — arm raised skyward, head tilted up, gentle sway.
      const raise = Math.sin(Math.min(phase / 1, 1) * Math.PI * 0.5);
      const sway = Math.sin(phase * 1.1) * 0.08;
      return {
        bodyBob: 0,
        headTiltX: -0.4 - sway * 0.3,
        headYawY: sway,
        holdArmZ: Math.PI * 0.75 * raise + sway * 0.1,
        freeArmZ: -sway * 0.1,
      };
    }
    case "berry": {
      // Quick repeated nibble — hand to mouth, a little head dip on each bite.
      const bite = Math.abs(Math.sin(phase * 5));
      return {
        bodyBob: 0,
        headTiltX: bite * 0.15,
        headYawY: 0,
        holdArmZ: Math.PI * 0.5 * bite,
        freeArmZ: 0,
      };
    }
    default: {
      // No prop — a stretch-and-look-around beat instead of standing frozen.
      const stretch = Math.sin(Math.min(phase / 1.4, 1) * Math.PI);
      const lookAround = phase > 1.4 ? Math.sin((phase - 1.4) * 0.9) * 0.5 : 0;
      return {
        bodyBob: stretch * 0.04,
        headTiltX: 0,
        headYawY: lookAround,
        holdArmZ: Math.PI * 0.5 * stretch,
        freeArmZ: -Math.PI * 0.5 * stretch,
      };
    }
  }
}

/** Arm mesh scale per hand shape — paw stays the round default capsule,
 * flipper flattens and widens it, wing flattens and elongates it. */
const HAND_SCALE: Record<HandShape, [number, number, number]> = {
  paw: [1, 1, 1],
  flipper: [1.6, 1, 0.45],
  wing: [2.4, 0.55, 1],
};

export default function CityBear({
  waypoints,
  speed = 0.6,
  phaseOffset = 0,
  color = "#8b5e3c",
  hold = "none",
  bodyScale = 1,
  earScale = 1,
  earStyle = "round",
  headScale = 1,
  snoutScale = 1,
  muzzleColor = "#e8d2b0",
  accessory = "none",
  accessoryColor = "#c4415a",
  handShape = "paw",
  tailStyle = "none",
  hasAntlers = false,
  hasBeak = false,
  index = 0,
  sharedPositions,
}: CityBearProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const armRefs = useRef<(THREE.Group | null)[]>([]);
  const earRadius = 0.07 * earScale;

  const { segmentLengths, totalLength } = useMemo(() => {
    const lengths: number[] = [];
    for (let i = 0; i < waypoints.length; i++) {
      const a = waypoints[i];
      const b = waypoints[(i + 1) % waypoints.length];
      lengths.push(Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    return {
      segmentLengths: lengths,
      totalLength: lengths.reduce((sum, l) => sum + l, 0),
    };
  }, [waypoints]);

  // Each leg of the route gets a walk phase, then a fixed pause+gesture phase at
  // its endpoint, before turning back — real "arrive and do something" behavior
  // instead of an endless treadmill loop.
  const { legs, cycleTotal } = useMemo(() => {
    const built = segmentLengths.map((len) => ({
      walkDuration: len / speed,
      pauseDuration: PAUSE_DURATION,
    }));
    const total = built.reduce(
      (sum, l) => sum + l.walkDuration + l.pauseDuration,
      0,
    );
    return { legs: built, cycleTotal: total };
  }, [segmentLengths, speed]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group || totalLength === 0 || cycleTotal === 0) return;

    const elapsed = clock.getElapsedTime() + phaseOffset;
    let t = elapsed % cycleTotal;
    let segmentIndex = 0;
    let walking = true;
    let segT = 0;
    let pausePhase = 0;

    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      if (t < leg.walkDuration) {
        segmentIndex = i;
        walking = true;
        segT = t / leg.walkDuration;
        break;
      }
      t -= leg.walkDuration;
      if (t < leg.pauseDuration) {
        segmentIndex = i;
        walking = false;
        pausePhase = t;
        break;
      }
      t -= leg.pauseDuration;
    }

    const a = waypoints[segmentIndex];
    const b = waypoints[(segmentIndex + 1) % waypoints.length];
    const facingDx = b[0] - a[0];
    const facingDz = b[1] - a[1];
    const nominalX = walking ? a[0] + facingDx * segT : b[0];
    const nominalZ = walking ? a[1] + facingDz * segT : b[1];

    // Fixed per-lane offsets alone can't guarantee zero overlap once several
    // streets' worth of bears share one intersection — so also nudge away
    // from any neighbor (from the shared registry every bear writes to)
    // that's currently closer than SEPARATION_RADIUS.
    let x = nominalX;
    let z = nominalZ;
    if (sharedPositions) {
      let pushX = 0;
      let pushZ = 0;
      for (let j = 0; j < sharedPositions.length; j += 2) {
        if (j === index * 2) continue;
        const dx = nominalX - sharedPositions[j];
        const dz = nominalZ - sharedPositions[j + 1];
        const distSq = dx * dx + dz * dz;
        if (distSq > 0.0001 && distSq < SEPARATION_RADIUS * SEPARATION_RADIUS) {
          const dist = Math.sqrt(distSq);
          const weight = (SEPARATION_RADIUS - dist) / SEPARATION_RADIUS;
          pushX += (dx / dist) * weight;
          pushZ += (dz / dist) * weight;
        }
      }
      x += pushX * SEPARATION_STRENGTH;
      z += pushZ * SEPARATION_STRENGTH;
    }

    // Landmarks (and their hoardings) are immovable, unlike another bear —
    // a soft nudge could still leave a bear rendered inside a building on a
    // slow approach. Hard-clamp to the exclusion circle's edge instead, so
    // a bear can never end up inside one, by construction, every frame.
    for (let k = 0; k < LANDMARK_EXCLUSIONS.length; k++) {
      const exclusion = LANDMARK_EXCLUSIONS[k];
      const dx = x - exclusion.x;
      const dz = z - exclusion.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < LANDMARK_EXCLUSION_RADIUS * LANDMARK_EXCLUSION_RADIUS) {
        const dist = Math.sqrt(distSq) || 0.001;
        x = exclusion.x + (dx / dist) * LANDMARK_EXCLUSION_RADIUS;
        z = exclusion.z + (dz / dist) * LANDMARK_EXCLUSION_RADIUS;
      }
    }

    if (sharedPositions) {
      sharedPositions[index * 2] = x;
      sharedPositions[index * 2 + 1] = z;
    }

    group.position.set(x, 0, z);
    group.rotation.y = Math.atan2(-facingDz, facingDx);

    if (walking) {
      // Bipedal waddle: alternating leg swing (Z-axis = fore/aft since
      // forward is local +X), a side-to-side hip roll, and a vertical bob.
      const walkCycle = clock.getElapsedTime() * speed * 6 + phaseOffset;
      legRefs.current.forEach((leg, i) => {
        if (!leg) return;
        const offset = i === 0 ? 0 : Math.PI;
        leg.rotation.z = Math.sin(walkCycle + offset) * 0.45;
      });
      armRefs.current.forEach((arm, i) => {
        if (!arm) return;
        const offset = i === 0 ? Math.PI : 0;
        arm.rotation.z = Math.sin(walkCycle + offset) * 0.3;
      });
      if (bodyRef.current) {
        bodyRef.current.position.y =
          0.62 + Math.abs(Math.sin(walkCycle)) * 0.03;
        bodyRef.current.rotation.z = Math.sin(walkCycle) * 0.07;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0;
        headRef.current.rotation.y = 0;
      }
    } else {
      // Arrived — stand still, legs settle, play the themed arrival gesture.
      legRefs.current.forEach((leg) => {
        if (leg) leg.rotation.z = 0;
      });
      const gesture = pauseGesture(hold, pausePhase);
      if (armRefs.current[0]) armRefs.current[0].rotation.z = gesture.holdArmZ;
      if (armRefs.current[1]) armRefs.current[1].rotation.z = gesture.freeArmZ;
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.62 + gesture.bodyBob;
        bodyRef.current.rotation.z = 0;
      }
      if (headRef.current) {
        headRef.current.rotation.x = gesture.headTiltX;
        headRef.current.rotation.y = gesture.headYawY;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group scale={3.4 * bodyScale}>
        {/* Legs — short, stubby, pivoted at the hip for a waddling step */}
        {[0.11, -0.11].map((z, i) => (
          <group
            key={z}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
            position={[0, 0.32, z]}
          >
            <mesh position={[0, -0.12, 0]} castShadow>
              <capsuleGeometry args={[0.11, 0.14, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          </group>
        ))}

        {/* Arms — short pivots at the shoulder, swinging opposite the legs.
            Index 0 (z=0.28) is the "holding" arm — it carries HeldItem so
            the prop rides along through the raise/toast/reel gesture. */}
        {[0.28, -0.28].map((z, i) => (
          <group
            key={z}
            ref={(el) => {
              armRefs.current[i] = el;
            }}
            position={[0, 0.78, z]}
          >
            <mesh
              position={[0, -0.1, 0]}
              scale={HAND_SCALE[handShape]}
              castShadow
            >
              <capsuleGeometry args={[0.075, 0.14, 4, 8]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
            {i === 0 && <HeldItem hold={hold} />}
          </group>
        ))}

        {/* Body — a chubby upright torso, bobs and rolls slightly with the waddle */}
        <group ref={bodyRef} position={[0, 0.62, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.32, 0.28, 6, 12]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>

          {/* Belly patch — the brand bears' signature two-tone marking */}
          <mesh position={[0.24, -0.06, 0]} scale={[0.55, 1, 0.8]} castShadow>
            <sphereGeometry args={[0.26, 16, 12]} />
            <meshStandardMaterial color={muzzleColor} roughness={0.85} />
          </mesh>

          <Tail style={tailStyle} color={color} accentColor={muzzleColor} />

          {/* Head — sits almost directly on the torso, minimal neck */}
          <group ref={headRef} position={[0, 0.46, 0]}>
            <mesh scale={headScale} castShadow>
              <sphereGeometry args={[0.27, 18, 14]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>

            {/* Face patch — flat, not a protruding snout, matching the brand art */}
            <mesh
              position={[0.19 * headScale, -0.03, 0]}
              scale={[0.7, 0.85, 1]}
              castShadow
            >
              <sphereGeometry args={[0.17 * headScale * snoutScale, 14, 10]} />
              <meshStandardMaterial color={muzzleColor} roughness={0.85} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.24 * headScale, 0.05, 0.1 * headScale]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#1a1210" roughness={0.4} />
            </mesh>
            <mesh position={[0.24 * headScale, 0.05, -0.1 * headScale]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#1a1210" roughness={0.4} />
            </mesh>

            {/* Nose — a small pointed beak for Penguin/Owl instead */}
            {hasBeak ? (
              <Beak headScale={headScale} snoutScale={snoutScale} />
            ) : (
              <mesh position={[0.32 * headScale * snoutScale, -0.02, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#2b1a10" roughness={0.6} />
              </mesh>
            )}

            <Ears
              style={earStyle}
              radius={earRadius}
              color={color}
              headScale={headScale}
            />
            {hasAntlers && <Antlers color={color} headScale={headScale} />}
            <Accessory
              type={accessory}
              color={accessoryColor}
              headScale={headScale}
            />
          </group>

          {accessory === "backpack" && <Backpack color={accessoryColor} />}
        </group>
      </group>
    </group>
  );
}
