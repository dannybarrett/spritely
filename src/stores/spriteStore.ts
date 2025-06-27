import { create } from "zustand";
import { Sprite } from "../types/sprite";

export interface SpriteState {
  sprite: Sprite | undefined;
}

export const useSpriteStore = create<SpriteState>(set => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => set({ sprite: newSprite }),
}));
