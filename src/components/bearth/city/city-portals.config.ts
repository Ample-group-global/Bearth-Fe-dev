import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  GavelIcon,
  LandmarkIcon,
  LeafIcon,
  MoonIcon,
  MountainIcon,
  PackageIcon,
  RocketIcon,
  ShoppingBagIcon,
  TreesIcon,
  WavesIcon,
  WindIcon,
  WineIcon,
} from "lucide-react";

export type CityPortalStatus = "live" | "coming-soon" | "lore";
/** Each landmark gets its own concept-accurate silhouette, not a shared archetype. */
export type CityLandmarkShape =
  | "rocket" // Starport
  | "transit-hub" // Moose Station
  | "stream-pavilion" // Interstellar Salmon Stream
  | "museum" // Memory Hall
  | "pod-cluster" // Dream Chamber
  | "archive-tower" // The Dream Archive
  | "capitol" // The Council
  | "greenhouse" // Eden Lab
  | "cave" // The Contemplation Cave
  | "market" // The Bazaar
  | "park" // Energy Park
  | "distillery" // Honey Nectar Distillery
  | "weather-tower"; // Atmosphere Tuning Tower

export interface CityPortal {
  id: string;
  label: string;
  description: string;
  /** Star rating (0-3) from Bearth City canon; higher = closer to the plaza center. */
  priority: 0 | 1 | 2 | 3;
  status: CityPortalStatus;
  /** Real route this landmark links to, or null if inert (coming-soon or lore-only). */
  href: string | null;
  position: [number, number, number];
  color: string;
  icon: LucideIcon;
  /** Procedural building silhouette rendered for this landmark. */
  shape: CityLandmarkShape;
  /** Vertical scale of the upper structure — real skylines aren't uniform height. */
  heightScale: number;
}

/**
 * A restrained, deliberate 3-tier palette by status rather than one-off hues
 * per landmark — makes the city read as a designed system (status is
 * legible from color alone at a glance) instead of a scatter of pastels.
 */
export const STATUS_COLOR: Record<CityPortalStatus, string> = {
  live: "#41afeb", // brand primary — reserved for landmarks you can actually visit
  "coming-soon": "#e8c88a", // warm gold — a real feature, not shipped yet
  lore: "#9fb3d1", // quiet neutral — world-building only, recedes visually
};

/**
 * All 13 landmarks from Bearth City canon
 * (see Bearth_City_Location_and_Landmark_Design.md), scattered around the
 * plaza rather than pinned to the street grid's intersections — an earlier
 * version placed every landmark exactly on a grid line, which meant groups
 * of 3-4 landmarks shared the same x or z coordinate and visibly lined up
 * in straight rows/columns. Each landmark sits at its own hand-picked
 * (angle, radius) around the origin, scaled 1.15x outward from the
 * original layout (2026-08-21, dialed back down from an initial 1.3x pass
 * that read as too spread out) to open up breathing room now that several
 * landmark silhouettes were widened — angles are unchanged so the
 * tiering/no-shared-axis design below still holds, only radius grew:
 * radius grows by tier — 4 "downtown" landmarks (★★★/★★) at radius ~21-25,
 * a ring of 5 (★) at ~33-37, and 4 outer ones (unstarred) at ~41-46 —
 * close enough together to read as one connected city rather than
 * scattered outposts, while distance-from-center still reads as "closer =
 * more central" and the plaza center isn't a dead zone. The downtown 4 get
 * their own 90°-apart angle set (they only need to clear each other, not
 * the ring/outer radii); ring/outer share a ~27.7° global step so none of
 * the 9 outer landmarks share an axis either.
 *
 * Two pairs needed a manual radius override on top of the uniform scale,
 * because a global scale factor doesn't fix a LOCAL angular-proximity
 * problem between landmarks on different tiers: Dream Chamber (ring) sits
 * only ~13° from Moose Station (downtown) despite the tier gap, and the
 * Bazaar's widened stall footprint sits close to the Contemplation Cave's
 * elongated tunnel along a shared diagonal. Both were pushed further out
 * along their own existing angle (angle never changed, to avoid newly
 * sharing an axis) until their gap to the nearest neighbor cleared a
 * ~4-5 unit safety margin past both shapes' actual reach — tighter than
 * every other pair's margin (>=16 units after the 1.15x scale) but still
 * positive. The outer tier's max radius (~46) is well inside the skyline
 * ring's start (69). Only
 * landmarks with a real shipped page are "live" — the rest surface real
 * lore now and light up once their feature ships:
 *
 * - "coming-soon": has a real mapped product action, no page yet.
 * - "lore": pure world-building, no product action was ever planned for it.
 */
export const cityPortals: CityPortal[] = [
  // Downtown core (★★★/★★) — the 4 central blocks
  {
    id: "starport",
    label: "Bearth Starport",
    description:
      "The launch point for interstellar exploration — every mint sends a new Bearth explorer rocketing into the unknown.",
    priority: 3,
    status: "live",
    href: "/mint",
    position: [20.6, 0.1, 7.5],
    color: STATUS_COLOR.live,
    icon: RocketIcon,
    shape: "rocket",
    heightScale: 2,
  },
  {
    id: "moose-station",
    label: "Bearth Moose Station",
    description:
      "The city's transport hub, where rewards from expeditions and community contributions are ferried home.",
    priority: 2,
    status: "coming-soon",
    href: null,
    position: [-8.3, 0.1, 22.7],
    color: STATUS_COLOR["coming-soon"],
    icon: PackageIcon,
    shape: "transit-hub",
    heightScale: 1.2,
  },
  {
    id: "salmon-stream",
    label: "Bearth Salmon Stream",
    description:
      "A glowing artificial stream of translucent energy-salmon, born from human climate tech left behind.",
    priority: 2,
    status: "lore",
    href: null,
    position: [-19.4, 0.1, -7.1],
    color: STATUS_COLOR.lore,
    icon: WavesIcon,
    shape: "stream-pavilion",
    heightScale: 1.2,
  },
  {
    id: "memory-hall",
    label: "Bearth Memory Hall",
    description:
      "A living museum preserving every explorer's journey — your personal gallery, forever expanding.",
    priority: 2,
    status: "live",
    href: "/collection",
    position: [8.6, 0.1, -23.8],
    color: STATUS_COLOR.live,
    icon: LandmarkIcon,
    shape: "museum",
    heightScale: 2.1,
  },

  // Surrounding ring of 5 blocks — ★ priority
  {
    id: "dream-chamber",
    label: "Bearth Dream Chamber",
    description:
      "The sacred space of Dream Missions, where deep sleep generates spiritual energy to fuel the community.",
    priority: 1,
    status: "coming-soon",
    href: null,
    position: [-21.8, 0.1, 33.5],
    color: STATUS_COLOR["coming-soon"],
    icon: MoonIcon,
    shape: "pod-cluster",
    heightScale: 1.6,
  },
  {
    id: "dream-archive",
    label: "Bearth Dream Archive",
    description:
      "A vast library of glowing crystal balls, each one a stored dream waiting to be relived.",
    priority: 1,
    status: "lore",
    href: null,
    position: [-31.1, 0.1, 17.6],
    color: STATUS_COLOR.lore,
    icon: BookOpenIcon,
    shape: "archive-tower",
    heightScale: 2,
  },
  {
    id: "council",
    label: "Bearth Council",
    description:
      "The supreme decision-making center of the Bear Clan, where citizens vote to shape the city's future.",
    priority: 1,
    status: "coming-soon",
    href: null,
    position: [-33.4, 0.1, 1.0],
    color: STATUS_COLOR["coming-soon"],
    icon: GavelIcon,
    shape: "capitol",
    heightScale: 2,
  },
  {
    id: "eden-lab",
    label: "Bearth Eden Lab",
    description:
      "The cradle of hope, where the Bear Clan researches how to restore Earth's ecology.",
    priority: 1,
    status: "lore",
    href: null,
    position: [-33.1, 0.1, -16.0],
    color: STATUS_COLOR.lore,
    icon: LeafIcon,
    shape: "greenhouse",
    heightScale: 1.4,
  },
  {
    id: "contemplation-cave",
    label: "Bearth Contemplation Cave",
    description:
      "A cozy cave of soft moss and dripping water, where bears ponder existence at the most laid-back pace.",
    priority: 1,
    status: "lore",
    href: null,
    position: [-20.5, 0.1, -27.7],
    color: STATUS_COLOR.lore,
    icon: MountainIcon,
    shape: "cave",
    heightScale: 1.5,
  },

  // Outer 4 blocks — unstarred (one corner left as open ground for variety)
  {
    id: "bazaar",
    label: "Bearth Shopping Market",
    description:
      "The city's grand shopping mall — walk through the entry gate into a bustling market of whimsical inventions and heartwarming handmade crafts.",
    priority: 0,
    status: "live",
    href: "/market",
    position: [-6.9, 0.1, -44.4],
    color: STATUS_COLOR.live,
    icon: ShoppingBagIcon,
    shape: "market",
    heightScale: 1.8,
  },
  {
    id: "energy-park",
    label: "Bearth Energy Park",
    description:
      "Home of the Bear Clan's offline sports events — every participant earns a badge on the Wall of Honor.",
    priority: 0,
    status: "coming-soon",
    href: null,
    position: [14.1, 0.1, -41.4],
    color: STATUS_COLOR["coming-soon"],
    icon: TreesIcon,
    shape: "park",
    heightScale: 1.3,
  },
  {
    id: "honey-nectar-distillery",
    label: "Bearth Honey Distillery",
    description:
      "Where accidental experiments with human brewing gear became the city's favorite after-hours hangout.",
    priority: 0,
    status: "lore",
    href: null,
    position: [30.1, 0.1, -28.4],
    color: STATUS_COLOR.lore,
    icon: WineIcon,
    shape: "distillery",
    heightScale: 1.6,
  },
  {
    id: "atmosphere-tuning-tower",
    label: "Bearth Atmosphere Tower",
    description:
      "A weather-control tower run by giant knobs — occasionally malfunctions into strawberry-flavored rain.",
    priority: 0,
    status: "lore",
    href: null,
    position: [44.3, 0.1, -12.4],
    color: STATUS_COLOR.lore,
    icon: WindIcon,
    shape: "weather-tower",
    heightScale: 2.6,
  },
];
