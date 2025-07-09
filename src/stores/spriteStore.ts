import { Sprite } from "@/lib/types";
import { copySprite } from "@/lib/utils";
import { create } from "zustand";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (sprite: Sprite | undefined) => void;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  currentLayer: number;
  setCurrentLayer: (layer: number) => void;
  prevHistory: Sprite[];
  nextHistory: Sprite[];
  undo: () => void;
  redo: () => void;
}

export const useSpriteStore = create<SpriteState>((set, get) => ({
  sprite: undefined,
  setSprite: (sprite: Sprite | undefined) => {
    let oldSprite = get().sprite;

    if (JSON.stringify(sprite) === JSON.stringify(oldSprite)) return;

    if (oldSprite) {
      oldSprite = copySprite(oldSprite);
      const prevHistory = get().prevHistory;
      prevHistory.push(oldSprite);
      set({ prevHistory });
    }

    const nextHistory = get().nextHistory;

    if (nextHistory.length > 0) {
      set({ nextHistory: [] });
    }
    set({ sprite });
  },
  currentFrame: 0,
  setCurrentFrame: (frame: number) => set({ currentFrame: frame }),
  currentLayer: 0,
  setCurrentLayer: (layer: number) => set({ currentLayer: layer }),
  prevHistory: [],
  nextHistory: [],
  undo: () => {
    const prevHistory = [...get().prevHistory];

    if (prevHistory.length === 0) return;
    let currentSprite = copySprite(get().sprite as Sprite);
    const nextHistory = [...get().nextHistory];
    nextHistory.push(currentSprite);

    let oldSprite = prevHistory.pop();

    set({
      sprite: oldSprite,
      prevHistory,
      nextHistory,
    });
  },
  redo: () => {
    const nextHistory = [...get().nextHistory];

    if (nextHistory.length === 0) return;
    let currentSprite = copySprite(get().sprite as Sprite);
    const prevHistory = [...get().prevHistory];
    prevHistory.push(currentSprite);

    let nextSprite = nextHistory[nextHistory.length - 1];
    nextHistory.pop();

    set({
      sprite: nextSprite,
      prevHistory,
      nextHistory,
    });
  },
}));
