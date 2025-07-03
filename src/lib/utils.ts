import { Layer, Pixel, Sprite } from "@/types/sprite";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgba(hex: string): Pixel {
  const arr = hex.split("");
  arr.splice(0, 1); // remove '#' from beginning of string

  const r = parseInt(arr.slice(0, 2).join(""), 16);
  const g = parseInt(arr.slice(2, 4).join(""), 16);
  const b = parseInt(arr.slice(4, 6).join(""), 16);
  const a = arr.length === 8 ? parseInt(arr.slice(6, 8).join(""), 16) : 255;

  return { r, g, b, a };
}

export function getLayerComposite(
  layers: Layer[],
  width: number,
  height: number
): Pixel[] {
  const blankPixel: Pixel = { r: 0, g: 0, b: 0, a: 0 };
  const bottom: Pixel[] = Array.from({ length: width * height }, () => ({
    ...blankPixel,
  }));

  for (const layer of layers) {
    for (let i = 0; i < layer.pixels.length; i++) {
      const currentPixel = layer.pixels[i];
      const bottomPixel = bottom[i];
      const normalizedAlpha = currentPixel.a / 255;
      const normalizedAlphaBottom = bottomPixel.a / 255;

      const r =
        currentPixel.r * normalizedAlpha +
        bottom[i].r * (1.0 - normalizedAlpha);
      const g =
        currentPixel.g * normalizedAlpha +
        bottom[i].g * (1.0 - normalizedAlpha);
      const b =
        currentPixel.b * normalizedAlpha +
        bottom[i].b * (1.0 - normalizedAlpha);
      const a =
        normalizedAlpha + normalizedAlphaBottom * (1.0 - normalizedAlpha);

      const rResult = Math.round(Math.max(0, Math.min(255, r)));
      const gResult = Math.round(Math.max(0, Math.min(255, g)));
      const bResult = Math.round(Math.max(0, Math.min(255, b)));
      const aResult = Math.round(Math.max(0, Math.min(255, a * 255)));

      bottom[i] = { r: rResult, g: gResult, b: bResult, a: aResult };
    }
  }

  return bottom;
}

export async function fill({
  pixels,
  width,
  height,
  index,
  oldColor,
  newColor,
}: {
  pixels: Pixel[];
  width: number;
  height: number;
  index: number;
  oldColor: Pixel;
  newColor: Pixel;
}) {
  const getIndex = (x: number, y: number) => y * width + x;
  const areEqual = (current: Pixel, target: Pixel) => {
    return (
      current.r === target.r &&
      current.g === target.g &&
      current.b === target.b &&
      current.a === target.a
    );
  };

  if (
    !areEqual(pixels[index], oldColor) ||
    areEqual(pixels[index], newColor) ||
    index < 0 ||
    index > pixels.length - 1
  ) {
    return;
  }

  pixels[index] = { ...newColor };

  const row = Math.floor(index / width);
  const column = index % width;
  const left = { x: column - 1, y: row };
  const right = { x: column + 1, y: row };
  const up = { x: column, y: row - 1 };
  const down = { x: column, y: row + 1 };

  if (left.x >= 0) {
    fill({
      pixels,
      width,
      height,
      index: getIndex(left.x, left.y),
      oldColor,
      newColor,
    });
  }

  if (right.x < width) {
    fill({
      pixels,
      width,
      height,
      index: getIndex(right.x, right.y),
      oldColor,
      newColor,
    });
  }

  if (up.y >= 0) {
    fill({
      pixels,
      width,
      height,
      index: getIndex(up.x, up.y),
      oldColor,
      newColor,
    });
  }

  if (down.y < height) {
    fill({
      pixels,
      width,
      height,
      index: getIndex(down.x, down.y),
      oldColor,
      newColor,
    });
  }
}
