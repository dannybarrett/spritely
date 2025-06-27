import { create } from "zustand";
import { Sprite } from "../types/sprite";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
}

export const useSpriteStore = create<SpriteState>(set => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => set({ sprite: newSprite }),
}));
