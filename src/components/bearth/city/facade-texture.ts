import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generates a small canvas-based facade texture (base panel color + a grid
 * of windows, some lit) and caches it by color. This is a single cheap
 * texture reused across every building of a given color — far lighter than
 * modeling individual window meshes, and reads with far more detail.
 */
export function getFacadeTexture(
  baseColor: string,
  windowColor = "#ffe9b8",
): THREE.CanvasTexture {
  const cacheKey = `${baseColor}-${windowColor}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, fallback);
    return fallback;
  }

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  // Subtle vertical panel seams
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  const panels = 8;
  for (let i = 1; i < panels; i++) {
    const x = (size / panels) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Deterministic window grid (seeded PRNG so it's stable across renders)
  const cols = 8;
  const rows = 10;
  const cellW = size / cols;
  const cellH = size / rows;
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = rand() > 0.45;
      const wx = c * cellW + cellW * 0.22;
      const wy = r * cellH + cellH * 0.22;
      const ww = cellW * 0.56;
      const wh = cellH * 0.56;
      ctx.fillStyle = lit ? windowColor : "rgba(6,10,23,0.5)";
      ctx.fillRect(wx, wy, ww, wh);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/** The emissive mask is the same drawing, but only the lit windows are non-black — everything else is pure black (no glow). */
export function getFacadeEmissiveTexture(
  baseColor: string,
  windowColor = "#ffe9b8",
): THREE.CanvasTexture {
  const cacheKey = `emissive-${baseColor}-${windowColor}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, fallback);
    return fallback;
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 10;
  const cellW = size / cols;
  const cellH = size / rows;
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = rand() > 0.45;
      if (!lit) continue;
      const wx = c * cellW + cellW * 0.22;
      const wy = r * cellH + cellH * 0.22;
      const ww = cellW * 0.56;
      const wh = cellH * 0.56;
      ctx.fillStyle = windowColor;
      ctx.fillRect(wx, wy, ww, wh);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
