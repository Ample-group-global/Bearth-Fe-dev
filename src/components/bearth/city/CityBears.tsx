"use client";

import { Color } from "three";
import type {
  BearAccessory,
  BearHold,
  EarStyle,
  HandShape,
  TailStyle,
} from "./CityBear";
import CityBear from "./CityBear";

/** A lighter/darker shade of the hero's color — lane fillers read as distinct
 * individuals sharing a family resemblance, not literal clones of the hero. */
function shade(hex: string, lightness: number): string {
  const c = new Color(hex);
  c.offsetHSL(0, 0, lightness);
  return `#${c.getHexString()}`;
}

interface BearRoute {
  name: string;
  waypoints: Array<[number, number]>;
  speed: number;
  phaseOffset: number;
  color: string;
  muzzleColor: string;
  hold: BearHold;
  bodyScale: number;
  earScale: number;
  earStyle: EarStyle;
  headScale: number;
  snoutScale: number;
  accessory: BearAccessory;
  accessoryColor: string;
  handShape: HandShape;
  tailStyle: TailStyle;
  hasAntlers: boolean;
  hasBeak: boolean;
}

/**
 * Landmark blocks sit at x,z ∈ {-30, -10.5, 10.5, 30} (the street grid).
 * Bears patrol the midpoints BETWEEN grid lines (x,z ∈ {-20.25, 0, 20.25}) —
 * each midpoint is well clear of the nearest landmark's hitbox radius, so
 * no route ever clips a building.
 *
 * Every bear owns one distinct edge of that 3×3 waypoint grid (12 bears,
 * 12 edges) — no two bears ever walk the same line. The only remaining
 * collision risk was the shared NODES (e.g. 4 different routes all meet at
 * the center point) — fixed by nudging each route a small fixed distance
 * off the true grid line, perpendicular to its own direction of travel, so
 * routes that share a node land on distinct points around it instead of
 * exactly on top of each other.
 *
 * 12 named bear characters — Bearth is a bear-branded universe, so each is
 * still a bear, themed toward its namesake through color, ear size, and
 * muzzle tone rather than a literal different-species anatomy: Panda gets
 * black fur with a white muzzle, Rabbit gets pale fur and big ears, Seal
 * gets grey fur with almost no visible ears, Fox gets rust-orange fur, etc.
 */
const BEAR_ROUTES: BearRoute[] = [
  {
    name: "Bear",
    // Lane-offset off the true grid line so this route's shared endpoints
    // never coincide with another bear's — see the note above BEAR_ROUTES.
    waypoints: [
      [-20.25, -18.85],
      [20.25, -18.85],
    ],
    speed: 0.55,
    phaseOffset: 0,
    color: "#8b5e3c",
    muzzleColor: "#e8d2b0",
    hold: "fish",
    bodyScale: 1,
    earScale: 1,
    earStyle: "round",
    headScale: 1,
    snoutScale: 1,
    accessory: "cap",
    accessoryColor: "#c4415a",
    handShape: "paw",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Luna",
    waypoints: [
      [-20.25, -21.65],
      [20.25, -21.65],
    ],
    speed: 0.5,
    phaseOffset: 1,
    color: "#7d8fa8",
    muzzleColor: "#e8e4d8",
    hold: "star",
    bodyScale: 0.95,
    earScale: 1,
    earStyle: "round",
    headScale: 1.05,
    snoutScale: 0.9,
    accessory: "bandana",
    accessoryColor: "#8fb0e8",
    handShape: "paw",
    tailStyle: "fluffy",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Andy",
    waypoints: [
      [-20.25, 1.4],
      [20.25, 1.4],
    ],
    speed: 0.6,
    phaseOffset: 2,
    color: "#9c5a3c",
    muzzleColor: "#e8d2b0",
    hold: "none",
    bodyScale: 1.05,
    earScale: 0.95,
    earStyle: "round",
    headScale: 1,
    snoutScale: 1,
    accessory: "cap",
    accessoryColor: "#c9662e",
    handShape: "paw",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Sloth",
    waypoints: [
      [-20.25, -1.4],
      [20.25, -1.4],
    ],
    speed: 0.3,
    phaseOffset: 3,
    color: "#7a7264",
    muzzleColor: "#d8d0c0",
    hold: "none",
    bodyScale: 1.1,
    earScale: 0.7,
    earStyle: "round",
    headScale: 1.1,
    snoutScale: 0.7,
    accessory: "none",
    accessoryColor: "#8b5e3c",
    handShape: "paw",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Panda",
    waypoints: [
      [-20.25, 21.65],
      [20.25, 21.65],
    ],
    speed: 0.5,
    phaseOffset: 4,
    color: "#2a2a2a",
    muzzleColor: "#f5f5f0",
    hold: "berry",
    bodyScale: 1.1,
    earScale: 1.1,
    earStyle: "round",
    headScale: 1.2,
    snoutScale: 0.65,
    accessory: "bow",
    accessoryColor: "#9d6fd1",
    handShape: "paw",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Brownie",
    waypoints: [
      [-20.25, 18.85],
      [20.25, 18.85],
    ],
    speed: 0.48,
    phaseOffset: 5,
    color: "#4a3020",
    muzzleColor: "#c9a876",
    hold: "mug",
    bodyScale: 0.9,
    earScale: 1,
    earStyle: "round",
    headScale: 1,
    snoutScale: 1,
    accessory: "bandana",
    accessoryColor: "#e8c88a",
    handShape: "paw",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Penguin",
    waypoints: [
      [-18.85, -20.25],
      [-18.85, 20.25],
    ],
    speed: 0.45,
    phaseOffset: 6,
    color: "#1a1a1a",
    muzzleColor: "#f0f0f0",
    hold: "fish",
    bodyScale: 0.9,
    earScale: 0.5,
    earStyle: "tiny",
    headScale: 0.95,
    snoutScale: 0.5,
    accessory: "none",
    accessoryColor: "#1a1a1a",
    handShape: "flipper",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: true,
  },
  {
    name: "Rabbit",
    waypoints: [
      [18.85, -20.25],
      [18.85, 20.25],
    ],
    speed: 0.7,
    phaseOffset: 7,
    color: "#f5f0e8",
    muzzleColor: "#f0c8c8",
    hold: "none",
    bodyScale: 0.8,
    earScale: 1.6,
    earStyle: "long",
    headScale: 0.9,
    snoutScale: 0.75,
    accessory: "bow",
    accessoryColor: "#f0c8c8",
    handShape: "paw",
    tailStyle: "pompom",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Deer",
    waypoints: [
      [-21.65, -20.25],
      [-21.65, 20.25],
    ],
    speed: 0.65,
    phaseOffset: 8,
    color: "#c9a876",
    muzzleColor: "#ede0c8",
    hold: "none",
    bodyScale: 1,
    earScale: 1.3,
    earStyle: "pointy",
    headScale: 0.85,
    snoutScale: 1.5,
    accessory: "bandana",
    accessoryColor: "#6fae7a",
    handShape: "paw",
    tailStyle: "pompom",
    hasAntlers: true,
    hasBeak: false,
  },
  {
    name: "Seal",
    waypoints: [
      [21.65, -20.25],
      [21.65, 20.25],
    ],
    speed: 0.4,
    phaseOffset: 9,
    color: "#6b7280",
    muzzleColor: "#4a5058",
    hold: "none",
    bodyScale: 1.15,
    earScale: 0.3,
    earStyle: "tiny",
    headScale: 1,
    snoutScale: 0.6,
    accessory: "backpack",
    accessoryColor: "#4a5058",
    handShape: "flipper",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Fox",
    waypoints: [
      [1.4, -20.25],
      [1.4, 20.25],
    ],
    speed: 0.68,
    phaseOffset: 10,
    color: "#c9662e",
    muzzleColor: "#f0e8d8",
    hold: "star",
    bodyScale: 0.85,
    earScale: 1.2,
    earStyle: "pointy",
    headScale: 0.85,
    snoutScale: 1.4,
    accessory: "cap",
    accessoryColor: "#f0e8d8",
    handShape: "paw",
    tailStyle: "fluffy",
    hasAntlers: false,
    hasBeak: false,
  },
  {
    name: "Owl",
    waypoints: [
      [-1.4, -20.25],
      [-1.4, 20.25],
    ],
    speed: 0.42,
    phaseOffset: 11,
    color: "#6b5d4f",
    muzzleColor: "#d4c8b8",
    hold: "none",
    bodyScale: 0.95,
    earScale: 0.9,
    earStyle: "round",
    headScale: 1.15,
    snoutScale: 0.55,
    accessory: "backpack",
    accessoryColor: "#d4c8b8",
    handShape: "wing",
    tailStyle: "none",
    hasAntlers: false,
    hasBeak: true,
  },
];

/**
 * 12 unique streets isn't enough surface area for 30+ bears without reusing
 * lines — so each hero street gets 2 extra "lane" bears (like real traffic
 * lanes) with their own timing, so nothing ever collides even though they
 * share a street. Three things this has to actively avoid:
 *
 * - Overlap: a rendered bear is ~2.2 world units across at this scale, so
 *   lanes closer together than that would visually clip through each other
 *   despite being "different lanes." Every pairwise gap here (including
 *   each lane vs the hero's own line at 0) is 4.0-8.0, well clear of that.
 * - Landmark clipping: hero routes already sit +-1.4 off the true grid
 *   midpoint (for node-avoidance — see the note above BEAR_ROUTES), which
 *   itself sits 9.75 units from the nearest landmark's grid line. A lane
 *   delta has to keep the total offset from the midpoint under roughly 6
 *   (9.75 minus the ~3.6 landmark hitbox radius) or a filler ends up
 *   walking through a building. 4.0 keeps a real margin under that.
 * - "Clone squad" look: same color + a uniformly-patterned phase offset
 *   applied identically on every street reads as a squad marching in
 *   formation. Fillers get a shaded (not identical) color and a per-hero,
 *   per-lane phase derived from both indices so no two streets share the
 *   same relative timing pattern.
 *
 * Fillers also skip the accessory and held-item props to keep the added
 * draw-call cost down. 12 heroes x 3 (1 hero + 2 lanes) = 36 bears total.
 */
function buildLaneFillers(hero: BearRoute, heroIndex: number): BearRoute[] {
  const isRowType = hero.waypoints[0][1] === hero.waypoints[1][1];
  const laneDeltas = [4, -4];
  const speedMults = [1.15, 0.85];
  const shadeAmounts = [0.1, -0.12];

  return laneDeltas.map((delta, i) => {
    const waypoints: Array<[number, number]> = hero.waypoints.map(([x, z]) =>
      isRowType ? [x, z + delta] : [x + delta, z],
    );
    return {
      ...hero,
      name: `${hero.name}-lane${i}`,
      waypoints,
      color: shade(hero.color, shadeAmounts[i]),
      phaseOffset: hero.phaseOffset * 2.3 + heroIndex * 3.1 + i * 7.9 + 5,
      speed: hero.speed * speedMults[i],
      hold: "none",
      accessory: "none",
    };
  });
}

/**
 * A single dedicated market vendor, stationed beside the Bearth Shopping
 * Market (bazaar, at [12.3, -36.0]) selling branded merch — not part of
 * BEAR_ROUTES/buildLaneFillers since a unique named vendor shouldn't get
 * cloned lane-fillers like the roaming heroes do. Its two waypoints are
 * only ~1.1 units apart (mostly stationary, a tiny pace) and both sit
 * outside the market's landmark-exclusion circle (center [14.1, -34.6],
 * radius 8, from CityBear.tsx) by a safe ~1-2 unit margin, so the vendor
 * reads as "posted up at a stall" without fighting the hard collision
 * clamp every frame.
 */
const MARKET_VENDOR: BearRoute = {
  name: "Vendor",
  waypoints: [
    [6.3, -41.0],
    [6.8, -40.0],
  ],
  speed: 0.2,
  phaseOffset: 6.4,
  color: "#c48a3c",
  muzzleColor: "#f0e0c0",
  hold: "shirt",
  bodyScale: 1,
  earScale: 1,
  earStyle: "round",
  headScale: 1,
  snoutScale: 1,
  accessory: "cap",
  accessoryColor: "#41afeb",
  handShape: "paw",
  tailStyle: "none",
  hasAntlers: false,
  hasBeak: false,
};

const ALL_BEAR_ROUTES: BearRoute[] = [
  ...BEAR_ROUTES.flatMap((hero, i) => [hero, ...buildLaneFillers(hero, i)]),
  MARKET_VENDOR,
];

/**
 * Fixed per-lane offsets alone can't guarantee zero overlap once several
 * streets' worth of bears converge on the same shared intersection — so
 * every bear also writes its rendered (x, z) into this shared array each
 * frame and reads its neighbors' from it, nudging apart from anyone too
 * close. One flat array (not React state) so 36 bears reading/writing it
 * every frame costs nothing beyond a few array accesses — no re-renders.
 */
const sharedPositions = new Float32Array(ALL_BEAR_ROUTES.length * 2);

export default function CityBears() {
  return (
    <>
      {ALL_BEAR_ROUTES.map((route, index) => (
        <CityBear
          key={`bear-${route.name}`}
          {...route}
          index={index}
          sharedPositions={sharedPositions}
        />
      ))}
    </>
  );
}
