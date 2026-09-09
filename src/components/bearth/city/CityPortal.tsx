"use client";

import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import CityLandmarkStructure from "./CityLandmarkStructure";
import type { CityPortal as CityPortalData } from "./city-portals.config";
import { getSignTexture } from "./sign-texture";

const STATUS_TEXT: Record<CityPortalData["status"], string | null> = {
  live: null,
  "coming-soon": "Coming Soon",
  lore: "Lore",
};

/**
 * A real physical hoarding — post planted in the ground plus a signboard
 * with the landmark's name baked onto a canvas texture (same technique
 * facade-texture.ts uses for windows). This replaces a screen-space Html
 * label: as real 3D geometry it gets correct depth, occlusion, and
 * perspective falloff for free, so it reads as the building's own sign
 * instead of text floating disconnected in the sky.
 */
function Hoarding({
  portal,
  hovered,
}: {
  portal: CityPortalData;
  hovered: boolean;
}) {
  const texture = useMemo(
    () =>
      getSignTexture(portal.label, portal.color, STATUS_TEXT[portal.status]),
    [portal.label, portal.color, portal.status],
  );
  const boardWidth = 5.5;
  const boardHeight = boardWidth * (280 / 896);
  const postHeight = 3.2;
  const boardY = postHeight + boardHeight / 2;

  // The hoarding's placement/facing used to be a single fixed world offset
  // and rotation shared by every landmark — that happened to look fine for
  // landmarks near one side of the plaza ring, but for a landmark on the
  // opposite side (e.g. the Atmosphere Tower, way out near one edge) the
  // same absolute rotation left the board's face nearly edge-on to the
  // direction you'd naturally view that landmark from. Fixed by computing
  // both relative to each landmark's own angle from the plaza center, so
  // every landmark's sign keeps the same *relative* placement/facing
  // (offset to the side, angled back) no matter where it sits on the ring.
  const radialAngle = Math.atan2(portal.position[0], portal.position[2]);
  const baseOffsetX = 6.75;
  const baseOffsetZ = 5.45;
  const hoardingX =
    baseOffsetX * Math.cos(radialAngle) + baseOffsetZ * Math.sin(radialAngle);
  const hoardingZ =
    -baseOffsetX * Math.sin(radialAngle) + baseOffsetZ * Math.cos(radialAngle);

  return (
    // Off to the side of the building, angled back toward the approach
    // path — a real hoarding stands beside the entrance, not planted
    // dead-center in the doorway blocking it. Radial distance from center
    // (~7.4, scaled up with the 2026-08-21 landmark size increase from
    // 3x to 3.3x) clears every shape's widest local extent — the shared
    // foundation alone is ~4.6, and wide silhouettes like the market body
    // or the stream-pavilion's roof disc reach nearly as far — so the sign
    // never clips into or hides behind the building it's labeling. Post
    // height (3.2) is taller than the board sits at street level next to
    // a landmark's foundation, not above the landmark itself — landmarks
    // range from ~11 to ~27 world units tall, far above any sign height,
    // so "visible" here means "not occluded by the foundation/nearby
    // silhouette from typical orbit angles," not "taller than the building."
    <group
      position={[hoardingX, 0, hoardingZ]}
      rotation={[0, radialAngle - 0.6, 0]}
      scale={hovered ? 1.05 : 1}
    >
      {/* Posts — tapered with a small round cap and a plinth at the base
          instead of a bare uniform cylinder, so the post reads as a built
          structure rather than a stick holding up a plane. */}
      {[-1.85, 1.85].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.15, 0.12, 10]} />
            <meshStandardMaterial color="#12182c" roughness={0.6} />
          </mesh>
          <mesh position={[0, postHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.08, postHeight, 10]} />
            <meshStandardMaterial
              color="#1c2544"
              roughness={0.5}
              metalness={0.25}
            />
          </mesh>
          <mesh position={[0, postHeight + 0.05, 0]} castShadow>
            <sphereGeometry args={[0.05, 12, 10]} />
            <meshStandardMaterial
              color={portal.color}
              emissive={portal.color}
              emissiveIntensity={hovered ? 1.0 : 0.5}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* No separate 3D frame/canopy here — both were tried and both read
          as stray disconnected shapes from steep top-down orbit angles
          (a flat glowing frame box foreshortens into a "floating bar", a
          tilted canopy roof reads as a diagonal plaque lying on the
          ground). The sign texture itself already bakes a colored double
          border, corner accents and a glow — that 2D treatment reads
          correctly from every angle since it's just the board's own
          face, unlike separate 3D geometry that can overlap oddly
          depending on viewing angle. Keep the hoarding's 3D parts to just
          the posts + board. */}

      {/* The board — a flat box, not a curved shell or a paper-thin plane.
          Both were tried and both broke: a curved surface warps the baked
          text, and splitting it into a plain curved shell plus a narrow
          flat panel in front left the shell visible as an unlabeled blank
          dark shape from wide orbit angles (the panel doesn't cover
          nearly enough of the shell's own visible arc). A flat box's front
          (+z) and back (-z) are genuinely separate faces with correct,
          non-mirrored UVs on each, so the label reads correctly from every
          angle with no edge case. No castShadow: this panel is small but
          wide and sits elevated above the reflective ground, so under the
          angled directional light it was throwing a large, oddly-shaped
          dark rectangle onto the plaza — not worth a sign's shadow. */}
      <mesh position={[0, boardY, 0]}>
        <boxGeometry args={[boardWidth, boardHeight, 0.1]} />
        <meshStandardMaterial
          attach="material-0"
          color="#1c2544"
          roughness={0.6}
        />
        <meshStandardMaterial
          attach="material-1"
          color="#1c2544"
          roughness={0.6}
        />
        <meshStandardMaterial
          attach="material-2"
          color="#1c2544"
          roughness={0.6}
        />
        <meshStandardMaterial
          attach="material-3"
          color="#1c2544"
          roughness={0.6}
        />
        <meshStandardMaterial
          attach="material-4"
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          roughness={0.5}
        />
        <meshStandardMaterial
          attach="material-5"
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

export default function CityPortal({ portal }: { portal: CityPortalData }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const isLive = portal.status === "live";
  // Approx visual top of the tallest shape elements, in world units — keeps
  // the hitbox above the structure even as heightScale varies a lot. The
  // trailing factor must match CityLandmarkStructure's outer group scale.
  const visualHeight = 3.2 * portal.heightScale * 3.3;

  return (
    <group ref={groupRef} position={portal.position}>
      <group scale={hovered ? 1.08 : 1}>
        <CityLandmarkStructure
          shape={portal.shape}
          color={portal.color}
          emissiveIntensity={hovered ? 1.5 : isLive ? 0.95 : 0.55}
          heightScale={portal.heightScale}
        />
      </group>

      <Hoarding portal={portal} hovered={hovered} />

      {/* Invisible interaction hitbox — decouples click/hover from the visual structure's shape */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: <mesh> is a three.js/R3F WebGL primitive, not an HTML element */}
      <mesh
        position={[0, visualHeight / 2 + 0.3, 0]}
        onClick={(event) => {
          event.stopPropagation();
          if (portal.href) router.push(portal.href);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = isLive ? "pointer" : "default";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[4.8, 4.8, visualHeight + 1, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Description card — a temporary hover call-out, not a permanent
          floating label, so it's fine as a screen-space overlay. */}
      {hovered && (
        <Html
          center
          position={[0, 2.2, 4.4]}
          zIndexRange={[10, 0]}
          occlude={false}
        >
          <div className="pointer-events-none w-52 rounded-xl bg-black/70 px-3 py-2 text-center text-[11px] leading-snug text-white shadow-xl">
            {portal.description}
          </div>
        </Html>
      )}
    </group>
  );
}
