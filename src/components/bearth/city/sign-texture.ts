import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Canvas-drawn hoarding face — a landmark's name (+ optional status badge)
 * baked to a texture and cached by content, the same technique
 * facade-texture.ts uses for building windows. Applying this to a real
 * signpost mesh means the name reads as physical signage with real depth
 * and occlusion, instead of a screen-space overlay with no grounding.
 */
export function getSignTexture(
  label: string,
  color: string,
  statusText: string | null,
): THREE.CanvasTexture {
  const cacheKey = `${label}-${color}-${statusText ?? ""}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const width = 896;
  const height = 280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, fallback);
    return fallback;
  }

  // Plate background — a subtle vertical gradient instead of a flat fill,
  // reading as a real backlit signboard rather than a printed sticker.
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#141d38");
  bg.addColorStop(1, "#080d1c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Colored accent header band — the landmark's own status color, so the
  // sign carries brand identity even before you read the text.
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, 16);

  // Corner accent marks — a small design flourish that reads as
  // deliberate signage styling instead of a bare rectangle.
  const corner = 34;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.lineTo(corner, 16);
  ctx.lineTo(0, 16 + corner);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(width, 16);
  ctx.lineTo(width - corner, 16);
  ctx.lineTo(width, 16 + corner);
  ctx.closePath();
  ctx.fill();

  // Outer colored border, inner soft white border — a double-frame plate
  // instead of a single translucent stroke.
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, width - 28, height - 28);

  // Name text, with a soft glow in the landmark's own color behind it
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 76px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    label.toUpperCase(),
    width / 2,
    statusText ? 118 : 146,
    width - 100,
  );
  ctx.restore();

  if (statusText) {
    // Divider line between title and status badge
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 90, 168);
    ctx.lineTo(width / 2 + 90, 168);
    ctx.stroke();

    ctx.font = "700 40px Arial, sans-serif";
    ctx.fillStyle = color;
    ctx.fillText(statusText.toUpperCase(), width / 2, 210);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
