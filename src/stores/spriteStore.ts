import { Sprite } from "@/lib/types";
import { create } from "zustand";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (sprite: Sprite | undefined) => void;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  currentLayer: number;
  setCurrentLayer: (layer: number) => void;
}

export const useSpriteStore = create<SpriteState>((set) => ({
  sprite: undefined,
  setSprite: (sprite: Sprite | undefined) => set({ sprite }),
  currentFrame: 0,
  setCurrentFrame: (frame: number) => set({ currentFrame: frame }),
  currentLayer: 0,
  setCurrentLayer: (layer: number) => set({ currentLayer: layer }),
}));
