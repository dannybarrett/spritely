import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Sprite } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copySprite(sprite: Sprite): Sprite {
  return {
    ...sprite,
    colors: [...sprite.colors],
    frames: sprite.frames.map(frame => ({
      ...frame,
      layers: frame.layers.map(layer => ({
        ...layer,
        pixels: new Uint8ClampedArray(layer.pixels),
      })),
    })),
  };
}

export function coordinatesToIndex(
  x: number,
  y: number,
  width: number
): number {
  return (y * width + x) * 4;
}

export function setPixel(
  pixels: Uint8ClampedArray,
  index: number,
  color: Uint8ClampedArray
) {
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

export function getColorAtIndex(
  pixels: Uint8ClampedArray,
  index: number
): Uint8ClampedArray {
  return new Uint8ClampedArray([
    pixels[index],
    pixels[index + 1],
    pixels[index + 2],
    pixels[index + 3],
  ]);
}

export function fill(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  oldColor: Uint8ClampedArray,
  newColor: Uint8ClampedArray
) {
  const index = coordinatesToIndex(x, y, width);

  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }

  if (
    pixels[index] === newColor[0] &&
    pixels[index + 1] === newColor[1] &&
    pixels[index + 2] === newColor[2] &&
    pixels[index + 3] === newColor[3]
  ) {
    return;
  }

  if (
    pixels[index] === oldColor[0] &&
    pixels[index + 1] === oldColor[1] &&
    pixels[index + 2] === oldColor[2] &&
    pixels[index + 3] === oldColor[3]
  ) {
    setPixel(pixels, index, newColor);
    fill(pixels, x - 1, y, width, height, oldColor, newColor);
    fill(pixels, x + 1, y, width, height, oldColor, newColor);
    fill(pixels, x, y - 1, width, height, oldColor, newColor);
    fill(pixels, x, y + 1, width, height, oldColor, newColor);
  }
}

export function hsbToRgb(
  hue: number,
  saturation: number,
  brightness: number
): number[] {
  // Normalize H, S, B to [0, 1] range for calculations
  const normalizedHue = hue / 360;
  const normalizedSaturation = saturation / 100;
  const normalizedBrightness = brightness / 100;

  let redComponent = 0;
  let greenComponent = 0;
  let blueComponent = 0;

  if (normalizedSaturation === 0) {
    // If saturation is 0, the color is a shade of gray.
    // All RGB components are equal to the brightness (scaled to 0-255).
    redComponent = greenComponent = blueComponent = normalizedBrightness;
  } else {
    // --- Intermediate Calculations for Saturated Colors ---

    // Calculate the sector of the color wheel (0-5)
    // Each sector is 60 degrees.
    const sectorIndex = Math.floor(normalizedHue * 6);

    // Calculate the fractional part of the hue within its sector
    // This indicates how far into the current 60-degree sector we are.
    const fractionalPart = normalizedHue * 6 - sectorIndex;

    // Calculate the components that will determine the final RGB values.
    // These 'p', 'q', 't' values represent the min, decreasing, and increasing
    // components within the current 60-degree color sector, based on
    // overall brightness and saturation.

    const p = normalizedBrightness * (1 - normalizedSaturation); // Minimum value (black contribution)
    const q =
      normalizedBrightness * (1 - fractionalPart * normalizedSaturation); // Component decreasing in value
    const t =
      normalizedBrightness * (1 - (1 - fractionalPart) * normalizedSaturation); // Component increasing in value

    // --- Assign RGB components based on the hue sector ---
    switch (sectorIndex) {
      case 0: // Red-Yellow sector (H: 0 to <60)
        redComponent = normalizedBrightness;
        greenComponent = t;
        blueComponent = p;
        break;
      case 1: // Yellow-Green sector (H: 60 to <120)
        redComponent = q;
        greenComponent = normalizedBrightness;
        blueComponent = p;
        break;
      case 2: // Green-Cyan sector (H: 120 to <180)
        redComponent = p;
        greenComponent = normalizedBrightness;
        blueComponent = t;
        break;
      case 3: // Cyan-Blue sector (H: 180 to <240)
        redComponent = p;
        greenComponent = q;
        blueComponent = normalizedBrightness;
        break;
      case 4: // Blue-Magenta sector (H: 240 to <300)
        redComponent = t;
        greenComponent = p;
        blueComponent = normalizedBrightness;
        break;
      case 5: // Magenta-Red sector (H: 300 to <360)
        redComponent = normalizedBrightness;
        greenComponent = p;
        blueComponent = q;
        break;
    }
  }

  // Convert the calculated RGB components (which are 0-1) to 0-255 range and round them
  return [
    Math.round(redComponent * 255),
    Math.round(greenComponent * 255),
    Math.round(blueComponent * 255),
  ];
}
