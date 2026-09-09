"use client";

import {
  Instance,
  Instances,
  MeshReflectorMaterial,
  Sparkles,
} from "@react-three/drei";
import { useMemo } from "react";

const CONCRETE_COLORS = ["#24315f", "#2c3c73", "#1a2447", "#334477"];
const GLASS_COLORS = ["#3b4f8f", "#5c7cc9", "#2f4a8a"];

interface RoofPiece {
  type: "step" | "spire" | "platform";
  position: [number, number, number];
  scale: [number, number, number];
}

interface Building {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  /** Two distinct material families — matte concrete vs glossy glass —
   * so the skyline isn't one repeated box type with only color swaps. */
  material: "concrete" | "glass";
  roof?: RoofPiece;
}

interface WindowBand {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

/**
 * Individual gridded windows (real squares, not full-width glowing bars) on
 * the two faces of each building that point back toward the city center —
 * the sides actually visible from the plaza. Floor count and window count
 * scale with the building's real height/width.
 */
function generateWindowBands(buildings: Building[]): WindowBand[] {
  const windows: WindowBand[] = [];
  const windowColors = ["#ffe9b8", "#a9d4f5"];

  buildings.forEach((building, buildingIndex) => {
    const [width, height, depth] = building.scale;
    if (height < 2.5) return;

    const floorCount = Math.min(9, Math.max(2, Math.floor(height / 1.3)));
    const colCount = Math.max(2, Math.min(4, Math.floor(width / 0.6)));
    const faceOffsetX =
      (building.position[0] < 0 ? 1 : -1) * (width / 2 + 0.02);
    const faceOffsetZ =
      (building.position[2] < 0 ? 1 : -1) * (depth / 2 + 0.02);

    for (let floor = 0; floor < floorCount; floor++) {
      const fy =
        building.position[1] -
        height / 2 +
        height * (0.12 + (floor / (floorCount - 1 || 1)) * 0.76);

      for (let col = 0; col < colCount; col++) {
        if ((buildingIndex + floor + col) % 3 === 2) continue; // some windows dark
        const color =
          windowColors[(buildingIndex + floor + col) % windowColors.length];
        const fracX = (col + 0.5) / colCount - 0.5;

        // Face pointing toward the X=0 plane (visible from most of the plaza)
        windows.push({
          id: `${building.id}-wx-${floor}-${col}`,
          position: [
            building.position[0] + faceOffsetX,
            fy,
            building.position[2] + fracX * depth * 0.7,
          ],
          scale: [
            0.04,
            (height / floorCount) * 0.4,
            Math.max(0.18, (depth / colCount) * 0.4),
          ],
          color,
        });
        // Face pointing toward the Z=0 plane
        windows.push({
          id: `${building.id}-wz-${floor}-${col}`,
          position: [
            building.position[0] + fracX * width * 0.7,
            fy,
            building.position[2] + faceOffsetZ,
          ],
          scale: [
            Math.max(0.18, (width / colCount) * 0.4),
            (height / floorCount) * 0.4,
            0.04,
          ],
          color,
        });
      }
    }
  });

  return windows;
}

function generateSkyline(): Building[] {
  const buildings: Building[] = [];
  // Kept well beyond the grid's outer edge (~42) and the camera's max
  // orbit distance (60) — a previous, tighter radius let the camera
  // clip inside a skyline building at some angles.
  const ringRadii = [69, 75, 81, 87, 93];

  ringRadii.forEach((radius, ringIndex) => {
    const count = 12 + ringIndex * 5;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ringIndex * 0.6;
      // Wide height/width range — a real skyline has short and tall
      // buildings side by side, not a narrow band of near-identical boxes.
      // Height now grows with ring distance (closer = shorter) instead of
      // being uniform across all 5 rings — a flat cap still let a tall
      // roll land in the CLOSEST ring, where camera proximity/alignment
      // makes it loom directly over a foreground landmark. Ring 0 tops out
      // at ~6.5; only the farthest ring reaches the old ~11 max.
      const height = 1.5 + ringIndex * 1.1 + ((i * 7 + ringIndex * 11) % 5);
      // Occasional needle-thin towers and wide short podiums, not just a
      // mid-range band of near-identical footprints.
      const widthRoll = (i * 5 + ringIndex * 3) % 7;
      const width =
        widthRoll === 0
          ? 0.6 // needle
          : widthRoll === 6
            ? 3.6 // podium
            : 0.9 + (widthRoll % 5) * 0.45;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const material: Building["material"] =
        (i + ringIndex) % 2 === 0 ? "concrete" : "glass";
      const palette = material === "concrete" ? CONCRETE_COLORS : GLASS_COLORS;
      const color = palette[(i + ringIndex) % palette.length];

      // Four distinct roof silhouettes cycling through the skyline —
      // flat-top, stepped/tiered, spire-capped, and twin-spike — instead
      // of one repeated box shape everywhere.
      const roofCycle = (i + ringIndex) % 4;
      let roof: RoofPiece | undefined;
      if (roofCycle === 1) {
        const stepWidth = width * 0.6;
        const stepHeight = 1 + ((i * 5 + ringIndex) % 3);
        roof = {
          type: "step",
          position: [x, height + stepHeight / 2, z],
          scale: [stepWidth, stepHeight, stepWidth],
        };
      } else if (roofCycle === 2) {
        const spireHeight = 1.5 + ((i * 3 + ringIndex) % 4) * 0.6;
        roof = {
          type: "spire",
          position: [x, height + spireHeight / 2, z],
          scale: [width * 0.55, spireHeight, width * 0.55],
        };
      } else if (roofCycle === 3) {
        // Flat cantilevered platform — a fourth silhouette distinct from
        // the step/spire caps, like a helipad overhang.
        roof = {
          type: "platform",
          position: [x, height + 0.1, z],
          scale: [width * 1.35, 0.2, width * 1.35],
        };
      }

      buildings.push({
        id: `ring-${ringIndex}-${i}`,
        position: [x, height / 2, z],
        scale: [width, height, width],
        color,
        material,
        roof,
      });
    }
  });

  return buildings;
}

export default function CityEnvironment() {
  const buildings = useMemo(() => generateSkyline(), []);
  const windowBands = useMemo(
    () => generateWindowBands(buildings),
    [buildings],
  );
  const concreteBuildings = useMemo(
    () => buildings.filter((b) => b.material === "concrete"),
    [buildings],
  );
  const glassBuildings = useMemo(
    () => buildings.filter((b) => b.material === "glass"),
    [buildings],
  );
  const stepRoofs = useMemo(
    () => buildings.filter((b) => b.roof?.type === "step"),
    [buildings],
  );
  const spireRoofs = useMemo(
    () => buildings.filter((b) => b.roof?.type === "spire"),
    [buildings],
  );
  const platformRoofs = useMemo(
    () => buildings.filter((b) => b.roof?.type === "platform"),
    [buildings],
  );

  return (
    <group>
      {/* City ground — a circular disc reading as the top of a floating
          island (see CityIsland for the rocky cliff edge/underside/
          mountains and the lower terrace holding the skyline). Radius
          stops well short of the skyline (69-93) — the whole point is
          this edge has to be close enough to the plaza to actually be
          visible in normal framing, not just at extreme zoom-out. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[66, 72]} />
        <MeshReflectorMaterial
          color="#0c1330"
          roughness={0.35}
          blur={[300, 100]}
          resolution={1024}
          mixBlur={0.6}
          mixStrength={1.2}
          mixContrast={1.1}
          depthScale={0.6}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.4}
          metalness={0.5}
        />
      </mesh>

      <Sparkles
        count={80}
        scale={[13, 3, 13]}
        size={2.5}
        speed={0.25}
        opacity={0.6}
        color="#a9d4f5"
        position={[0, 1.5, 0]}
      />


      {/* Concrete family — matte, no reflectivity */}
      <Instances limit={concreteBuildings.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#1a2447"
          emissiveIntensity={0.25}
          roughness={0.75}
          metalness={0}
        />
        {concreteBuildings.map((building) => (
          <Instance
            key={building.id}
            position={building.position}
            scale={building.scale}
            color={building.color}
          />
        ))}
      </Instances>

      {/* Glass family — glossy, reflective, distinctly different surface from concrete */}
      <Instances limit={glassBuildings.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#1a2447"
          emissiveIntensity={0.2}
          roughness={0.15}
          metalness={0.6}
        />
        {glassBuildings.map((building) => (
          <Instance
            key={building.id}
            position={building.position}
            scale={building.scale}
            color={building.color}
          />
        ))}
      </Instances>

      {/* Cantilevered platform caps — the fourth roof silhouette */}
      <Instances limit={platformRoofs.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#1a2447"
          emissiveIntensity={0.3}
          roughness={0.35}
          metalness={0.25}
        />
        {platformRoofs.map((building) => (
          <Instance
            key={`${building.id}-roof`}
            position={building.roof?.position}
            scale={building.roof?.scale}
            color={building.color}
          />
        ))}
      </Instances>

      {/* Stepped tops — one of three roof silhouettes in the skyline */}
      <Instances limit={stepRoofs.length} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          emissive="#1a2447"
          emissiveIntensity={0.25}
          roughness={0.5}
          metalness={0.15}
        />
        {stepRoofs.map((building) => (
          <Instance
            key={`${building.id}-roof`}
            position={building.roof?.position}
            scale={building.roof?.scale}
            color={building.color}
          />
        ))}
      </Instances>

      {/* Spire caps — the second alternate roof silhouette */}
      <Instances limit={spireRoofs.length} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial
          emissive="#1a2447"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.2}
        />
        {spireRoofs.map((building) => (
          <Instance
            key={`${building.id}-roof`}
            position={building.roof?.position}
            scale={building.roof?.scale}
            color={building.color}
          />
        ))}
      </Instances>

      {/* Lit window bands on the skyline — floor count scales with height */}
      <Instances limit={windowBands.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
        {windowBands.map((band) => (
          <Instance
            key={band.id}
            position={band.position}
            scale={band.scale}
            color={band.color}
          />
        ))}
      </Instances>

      {/* Distant ice sheet horizon, grounding the "floating city" premise */}
      <mesh position={[0, -42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[400, 32]} />
        <meshStandardMaterial color="#c9dced" roughness={0.6} />
      </mesh>

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[18, 26, 12]}
        intensity={2.1}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={55}
      />
      <directionalLight
        position={[-14, 10, -10]}
        intensity={0.4}
        color="#41afeb"
      />
      <hemisphereLight args={["#41afeb", "#0f1730", 0.55]} />
    </group>
  );
}
