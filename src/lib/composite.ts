import { Frame } from "./types";

export function compositeFrame(
  frame: Frame,
  width: number,
  height: number
): Uint8ClampedArray {
  const bottom = new Uint8ClampedArray(width * height * 4);

  for (const layer of frame.layers) {
    if (!layer.visible) {
      continue;
    }

    for (let i = 0; i < layer.pixels.length; i += 4) {
      const currentR = layer.pixels[i];
      const currentG = layer.pixels[i + 1];
      const currentB = layer.pixels[i + 2];
      const currentA = layer.pixels[i + 3];

      const bottomR = bottom[i];
      const bottomG = bottom[i + 1];
      const bottomB = bottom[i + 2];
      const bottomA = bottom[i + 3];

      const normalizedAlpha = currentA / 255;
      const normalizedAlphaBottom = bottomA / 255;

      const r = currentR * normalizedAlpha + bottomR * (1.0 - normalizedAlpha);
      const g = currentG * normalizedAlpha + bottomG * (1.0 - normalizedAlpha);
      const b = currentB * normalizedAlpha + bottomB * (1.0 - normalizedAlpha);
      const a =
        normalizedAlpha + normalizedAlphaBottom * (1.0 - normalizedAlpha);

      const rResult = Math.round(Math.max(0, Math.min(255, r)));
      const gResult = Math.round(Math.max(0, Math.min(255, g)));
      const bResult = Math.round(Math.max(0, Math.min(255, b)));
      const aResult = Math.round(Math.max(0, Math.min(255, a * 255)));

      bottom[i] = rResult;
      bottom[i + 1] = gResult;
      bottom[i + 2] = bResult;
      bottom[i + 3] = aResult;
    }
  }

  return bottom;
}
