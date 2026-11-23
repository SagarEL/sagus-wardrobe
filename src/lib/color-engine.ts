import { CURATED_COLOURS } from "@/lib/constants";
import { Colour } from "@/types";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0");
  const num = parseInt(full.slice(0, 6), 16);
  if (isNaN(num)) return { r: 128, g: 128, b: 128 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

export function rgbToLab({ r, g, b }: RGB): LAB {
  let rLinear = r / 255;
  let gLinear = g / 255;
  let bLinear = b / 255;

  rLinear =
    rLinear > 0.04045
      ? Math.pow((rLinear + 0.055) / 1.055, 2.4)
      : rLinear / 12.92;
  gLinear =
    gLinear > 0.04045
      ? Math.pow((gLinear + 0.055) / 1.055, 2.4)
      : gLinear / 12.92;
  bLinear =
    bLinear > 0.04045
      ? Math.pow((bLinear + 0.055) / 1.055, 2.4)
      : bLinear / 12.92;

  const x = (rLinear * 0.4124 + gLinear * 0.3576 + bLinear * 0.1805) / 0.95047;
  const y = (rLinear * 0.2126 + gLinear * 0.7152 + bLinear * 0.0722) / 1.0;
  const z = (rLinear * 0.0193 + gLinear * 0.1192 + bLinear * 0.9505) / 1.08883;

  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function deltaE(lab1: LAB, lab2: LAB): number {
  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

export function inferColorFamily(
  hex: string
): "neutral" | "warm" | "cool" | "earth" | "pastel" | "jewel" {
  const { h, s, l } = hexToHsl(hex);
  if (s <= 14 || l <= 15 || l >= 92) return "neutral";
  if (l >= 72 && s <= 55) return "pastel";
  if (h >= 22 && h <= 46 && s <= 62 && l >= 20 && l <= 84) return "earth";
  if (h >= 65 && h <= 145 && s <= 48 && l <= 55) return "earth";
  if (l <= 42 && s >= 45) return "jewel";
  if ((h >= 0 && h < 68) || h >= 330) return "warm";
  return "cool";
}

/**
 * Given any HEX code, finds the closest named colour in CURATED_COLOURS
 * using perceptual CIELAB Delta-E distance.
 */
export function findClosestNamedColor(hex: string): Colour {
  const targetLab = rgbToLab(hexToRgb(hex));
  let bestMatch: Colour = CURATED_COLOURS[0];
  let minDistance = Infinity;

  for (const curated of CURATED_COLOURS) {
    const curatedLab = rgbToLab(hexToRgb(curated.hex));
    const dist = deltaE(targetLab, curatedLab);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = curated;
    }
  }

  // If fairly close to a named swatch, use its readable name and canonical or extracted hex
  return {
    name: bestMatch.name,
    hex: minDistance < 14 ? bestMatch.hex : hex.toUpperCase(),
    family: bestMatch.family || inferColorFamily(hex),
  };
}

export interface ExtractedColorPalette {
  mainColor: Colour;
  secondaryColor?: Colour;
  palette: Colour[];
}

/**
 * Extracts dominant garment colours from an image DataURL in the browser using Canvas.
 * Ignores outer studio border pixels and transparent pixels so the garment itself dominates.
 */
export async function extractColorsFromImage(
  dataUrl: string
): Promise<ExtractedColorPalette> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve({
        mainColor: CURATED_COLOURS[0],
        palette: [CURATED_COLOURS[0]],
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const size = 80;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({
            mainColor: CURATED_COLOURS[0],
            palette: [CURATED_COLOURS[0]],
          });
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;

        // Detect average corner colour (to discount studio backdrop if uniform)
        const cornerCoords = [
          [2, 2],
          [size - 3, 2],
          [2, size - 3],
          [size - 3, size - 3],
        ];
        const cornerLabs: LAB[] = [];
        for (const [cx, cy] of cornerCoords) {
          const idx = (cy * size + cx) * 4;
          if (imageData[idx + 3] > 180) {
            cornerLabs.push(
              rgbToLab({
                r: imageData[idx],
                g: imageData[idx + 1],
                b: imageData[idx + 2],
              })
            );
          }
        }

        const bgLab =
          cornerLabs.length > 0 ? cornerLabs[0] : { l: 98, a: 0, b: 0 };

        // Bucket pixels by quantized RGB (step 24) with center weighting
        const buckets = new Map<
          string,
          { rSum: number; gSum: number; bSum: number; weight: number }
        >();

        for (let y = 6; y < size - 6; y++) {
          for (let x = 6; x < size - 6; x++) {
            const idx = (y * size + x) * 4;
            const r = imageData[idx];
            const g = imageData[idx + 1];
            const b = imageData[idx + 2];
            const a = imageData[idx + 3];

            if (a < 128) continue; // Ignore transparent

            const pixLab = rgbToLab({ r, g, b });
            // Check distance to corner background
            const bgDist = deltaE(pixLab, bgLab);

            // Distance from center (0 at center, ~1 at edges)
            const dx = (x - size / 2) / (size / 2);
            const dy = (y - size / 2) / (size / 2);
            const distFromCenter = Math.sqrt(dx * dx + dy * dy);

            // If pixel looks very similar to corner studio backdrop and is near edges, skip
            if (bgDist < 8 && distFromCenter > 0.45) continue;

            // Center-weighted importance
            const weight =
              distFromCenter < 0.55 ? 2.5 : distFromCenter < 0.8 ? 1.2 : 0.4;

            const qR = Math.round(r / 24) * 24;
            const qG = Math.round(g / 24) * 24;
            const qB = Math.round(b / 24) * 24;
            const key = `${qR},${qG},${qB}`;

            const existing = buckets.get(key);
            if (existing) {
              existing.rSum += r * weight;
              existing.gSum += g * weight;
              existing.bSum += b * weight;
              existing.weight += weight;
            } else {
              buckets.set(key, {
                rSum: r * weight,
                gSum: g * weight,
                bSum: b * weight,
                weight,
              });
            }
          }
        }

        const sortedBuckets = Array.from(buckets.values()).sort(
          (a, b) => b.weight - a.weight
        );

        const extractedColours: Colour[] = [];
        for (const bucket of sortedBuckets) {
          if (bucket.weight <= 0) continue;
          const avgR = Math.round(bucket.rSum / bucket.weight);
          const avgG = Math.round(bucket.gSum / bucket.weight);
          const avgB = Math.round(bucket.bSum / bucket.weight);
          const hex = rgbToHex(avgR, avgG, avgB);
          const named = findClosestNamedColor(hex);

          // Avoid duplicate colour names in top palette
          if (!extractedColours.some((c) => c.name === named.name)) {
            extractedColours.push(named);
          }
          if (extractedColours.length >= 5) break;
        }

        if (extractedColours.length === 0) {
          resolve({
            mainColor: CURATED_COLOURS[0],
            palette: [CURATED_COLOURS[0]],
          });
          return;
        }

        resolve({
          mainColor: extractedColours[0],
          secondaryColor:
            extractedColours.length > 1 ? extractedColours[1] : undefined,
          palette: extractedColours,
        });
      } catch {
        resolve({
          mainColor: CURATED_COLOURS[0],
          palette: [CURATED_COLOURS[0]],
        });
      }
    };

    img.onerror = () => {
      resolve({
        mainColor: CURATED_COLOURS[0],
        palette: [CURATED_COLOURS[0]],
      });
    };

    img.src = dataUrl;
  });
}

/**
 * Compresses/resizes an uploaded image file so IndexedDB stays fast and responsive
 * while preserving crisp high-resolution visual quality (max 900px dimension).
 */
export async function processUploadedImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error("Failed to read file"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/webp", 0.88);
        resolve(compressed.startsWith("data:image/webp") ? compressed : canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsDataURL(file);
  });
}
