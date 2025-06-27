import { Pixel } from "@/types/sprite";
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
