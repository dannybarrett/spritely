import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Sprite } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copySprite(sprite: Sprite): Sprite {
  return {
    ...sprite,
    frames: sprite.frames.map((frame) => ({
      ...frame,
      layers: frame.layers.map((layer) => ({
        ...layer,
        pixels: new Uint8ClampedArray(layer.pixels),
      })),
    })),
  };
}

export function coordinatesToIndex(
  x: number,
  y: number,
  width: number,
): number {
  return (y * width + x) * 4;
}

export function setPixel(
  pixels: Uint8ClampedArray,
  index: number,
  color: Uint8ClampedArray,
) {
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

export function fill(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  oldColor: Uint8ClampedArray,
  newColor: Uint8ClampedArray,
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
