import { create } from "zustand";
import { Pixel, Sprite } from "../types/sprite";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
  colors: Pixel[];
  setColors: (newColors: Pixel[]) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
}

export const useSpriteStore = create<SpriteState>(set => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => set({ sprite: newSprite }),
  colors: [],
  setColors: (newColors: Pixel[]) => set({ colors: newColors }),
  brush: "pencil",
  setBrush: (newBrush: string) => set({ brush: newBrush }),
}));
