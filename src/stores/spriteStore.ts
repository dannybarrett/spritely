import { create } from "zustand";
import { Pixel, Sprite } from "../types/sprite";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
  color: Pixel;
  setColor: (newColor: Pixel) => void;
  altColor: Pixel;
  setAltColor: (newColor: Pixel) => void;
}

export const useSpriteStore = create<SpriteState>(set => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => set({ sprite: newSprite }),
  brush: "pencil",
  setBrush: (newBrush: string) => set({ brush: newBrush }),
  color: { r: 255, g: 255, b: 255, a: 255 },
  setColor: (newColor: Pixel) => set({ color: newColor }),
  altColor: { r: 0, g: 0, b: 0, a: 255 },
  setAltColor: (newColor: Pixel) => set({ altColor: newColor }),
}));
