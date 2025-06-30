import { create } from "zustand";
import { Frame, Layer, Pixel, Sprite } from "../types/sprite";
import { invoke } from "@tauri-apps/api/core";

interface History {
  prev: Sprite[];
  next: Sprite[];
}

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
  color: Pixel;
  setColor: (newColor: Pixel) => void;
  altColor: Pixel;
  setAltColor: (newColor: Pixel) => void;
  history: History;
  undo: () => void;
  redo: () => void;
  save: (path: string) => void;
  savePath: string | undefined;
  open: (path: string) => void;
}

export function deepCopySprite(s: Sprite): Sprite {
  if (!s) return s;

  return {
    ...s,
    frames: s.frames.map((frame: Frame) => ({
      ...frame,
      layers: frame.layers.map((layer: Layer) => ({
        ...layer,
        pixels: layer.pixels.map((pixel: Pixel) => ({
          ...pixel,
        })),
      })),
    })),
  };
}

export const useSpriteStore = create<SpriteState>((set, get) => ({
  sprite: undefined,
  setSprite: (newSprite: Sprite) => {
    if (JSON.stringify(newSprite) === JSON.stringify(get().sprite)) {
      return;
    }
    const current = get().sprite;

    const newPrev = [...get().history.prev];

    if (current) {
      newPrev.push(deepCopySprite(current));
    }

    set({
      history: {
        prev: newPrev,
        next: [],
      },
      sprite: newSprite,
    });
  },
  brush: "pencil",
  setBrush: (newBrush: string) => set({ brush: newBrush }),
  color: { r: 255, g: 255, b: 255, a: 255 },
  setColor: (newColor: Pixel) => set({ color: newColor }),
  altColor: { r: 0, g: 0, b: 0, a: 255 },
  setAltColor: (newColor: Pixel) => set({ altColor: newColor }),
  history: {
    prev: [],
    next: [],
  },
  undo: () => {
    if (get().history.prev.length === 0) {
      return;
    }

    const current = get().sprite;

    const newPrev = [...get().history.prev];
    let newNext = [...get().history.next];

    if (current) {
      newNext = [deepCopySprite(current), ...newNext];
    }

    const newSprite = newPrev.pop();

    set({
      history: {
        prev: newPrev,
        next: newNext,
      },
      sprite: newSprite,
    });

    console.log(history, get().history);
  },
  redo: () => {
    if (get().history.next.length === 0) {
      return;
    }

    const current = get().sprite;

    const newPrev = [...get().history.prev];
    if (current) {
      newPrev.push(deepCopySprite(current));
    }
    const newNext = [...get().history.next];
    const newSprite = newNext.shift();

    set({
      history: {
        prev: newPrev,
        next: newNext,
      },
      sprite: newSprite,
    });
  },
  save: async (path: string) => {
    const response = await invoke("save", {
      path,
      sprite: JSON.stringify(get().sprite),
    });

    if (response === "success") {
      set({
        history: {
          prev: [],
          next: [],
        },
        savePath: path,
      });
    }
  },
  savePath: undefined,
  open: async (path: string) => {
    const response = await invoke("open", {
      path,
    });

    if ((response as string).startsWith("Error")) {
      return console.error(response);
    }

    set({
      savePath: path,
      history: {
        prev: [],
        next: [],
      },
      sprite: JSON.parse(response as string),
    });
  },
}));
