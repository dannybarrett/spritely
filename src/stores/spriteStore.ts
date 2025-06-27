import { create } from "zustand";
import { Sprite } from "../types/sprite";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
}

export const useSpriteStore = create<SpriteState>(set => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => set({ sprite: newSprite }),
  brush: "pencil",
  setBrush: (newBrush: string) => set({ brush: newBrush }),
}));
