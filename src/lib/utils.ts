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
