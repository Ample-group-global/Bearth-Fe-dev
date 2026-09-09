"use client";

const ROAD_COLOR = "#3d4d78";
const ROAD_EDGE_COLOR = "#242e4d";
const ROAD_LINE_COLOR = "#8fb0e8";

/** Grid columns/rows — matches the landmark block coordinates in city-portals.config.ts. */
const GRID_LINES = [-30, -10.5, 10.5, 30];
const GRID_EXTENT = 39;

function Street({ type, offset }: { type: "column" | "row"; offset: number }) {
  const length = GRID_EXTENT * 2;
  const rotationY = type === "row" ? Math.PI / 2 : 0;
  const position: [number, number, number] =
    type === "column" ? [offset, 0.03, 0] : [0, 0.03, offset];

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Dark curb edges, giving the road bed a visible silhouette against
          the reflective ground instead of reading as a bare glow line */}
      <mesh position={[1.05, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.08, length]} />
        <meshStandardMaterial color={ROAD_EDGE_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[-1.05, 0.02, 0]} receiveShadow>
        <boxGeometry args={[0.15, 0.08, length]} />
        <meshStandardMaterial color={ROAD_EDGE_COLOR} roughness={0.9} />
      </mesh>
      {/* Asphalt bed — wider and lighter so it reads as a real paved surface */}
      <mesh receiveShadow>
        <boxGeometry args={[2.2, 0.06, length]} />
        <meshStandardMaterial color={ROAD_COLOR} roughness={0.75} />
      </mesh>
      {/* Dashed centerline instead of one continuous neon strip */}
      {Array.from({ length: Math.floor(length / 3) }, (_, i) => {
        const segStart = -length / 2 + i * 3;
        return (
          <mesh key={segStart} position={[0, 0.035, segStart + 0.9]}>
            <boxGeometry args={[0.1, 0.01, 1.4]} />
            <meshStandardMaterial
              color={ROAD_LINE_COLOR}
              emissive={ROAD_LINE_COLOR}
              emissiveIntensity={1.1}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** A real street grid — parallel avenues forming blocks, replacing the old concentric rings/spokes. */
export default function CityRoads() {
  return (
    <group>
      {GRID_LINES.map((x) => (
        <Street key={`col-${x}`} type="column" offset={x} />
      ))}
      {GRID_LINES.map((z) => (
        <Street key={`row-${z}`} type="row" offset={z} />
      ))}
    </group>
  );
}
