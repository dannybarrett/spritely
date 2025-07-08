import { Sprite } from "@/lib/types";
import { create } from "zustand";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (sprite: Sprite | undefined) => void;
}

export const useSpriteStore = create<SpriteState>((set) => ({
  sprite: undefined,
  setSprite: (sprite: Sprite | undefined) => set({ sprite }),
}));
