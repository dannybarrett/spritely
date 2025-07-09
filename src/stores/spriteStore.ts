import { Sprite } from "@/lib/types";
import { copySprite } from "@/lib/utils";
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

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
  savePath: string;
  setSavePath: (path: string) => void;
  saveSprite: (path: string | undefined) => Promise<void>;
  openSprite: (path: string) => Promise<void>;
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

    let nextSprite = nextHistory.pop();
    set({
      sprite: nextSprite,
      prevHistory,
      nextHistory,
    });
  },
  savePath: "",
  setSavePath: (path: string) => set({ savePath: path }),
  saveSprite: async (path: string | undefined) => {
    const sprite = get().sprite;
    if (!sprite) return;

    const savePath = get().savePath;
    if (!savePath) {
      if (!path) return;
      set({ savePath: path });
    }

    // Uint8ClampedArray is not serializable, so we need to convert it to a number array
    let copy = copySprite(sprite);
    let serializedSprite = JSON.parse(
      JSON.stringify({
        ...copy,
        frames: copy.frames.map(frame => ({
          ...frame,
          layers: frame.layers.map(layer => ({
            ...layer,
            pixels: Array.from(layer.pixels),
          })),
        })),
      })
    );

    const response = await invoke("save_sprite", {
      sprite: JSON.stringify(serializedSprite),
      path: path ?? savePath,
    });

    if (response === "success") {
      set({
        prevHistory: [],
        nextHistory: [],
      });
    }
  },
  openSprite: async (path: string) => {
    const spriteString = await invoke("open_sprite", { path });
    const sprite = JSON.parse(spriteString as string);

    for (const frame of sprite.frames) {
      for (const layer of frame.layers) {
        layer.pixels = new Uint8ClampedArray(layer.pixels);
      }
    }

    set({ sprite });
  },
}));
