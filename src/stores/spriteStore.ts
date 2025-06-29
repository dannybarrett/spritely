import { create } from "zustand";
import { Frame, Layer, Pixel, Sprite } from "../types/sprite";
import { invoke } from "@tauri-apps/api/core";

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
  color: Pixel;
  setColor: (newColor: Pixel) => void;
  altColor: Pixel;
  setAltColor: (newColor: Pixel) => void;
  history: Sprite[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  save: (path: string) => void;
  savePath: string | undefined;
  setSavePath: (path: string) => void;
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

    const newHistory = [...get().history];

    if (get().historyIndex < get().history.length - 1) {
      newHistory.splice(
        get().historyIndex + 1,
        get().history.length - get().historyIndex
      );
    }

    newHistory.push(deepCopySprite(newSprite));
    set({
      sprite: newSprite,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  brush: "pencil",
  setBrush: (newBrush: string) => set({ brush: newBrush }),
  color: { r: 255, g: 255, b: 255, a: 255 },
  setColor: (newColor: Pixel) => set({ color: newColor }),
  altColor: { r: 0, g: 0, b: 0, a: 255 },
  setAltColor: (newColor: Pixel) => set({ altColor: newColor }),
  history: [],
  historyIndex: -1,
  undo: () => {
    if (get().historyIndex <= 0) return;

    let newHistoryIndex = 0;

    if (get().historyIndex === -1) {
      newHistoryIndex = history.length - 1;
    } else if (get().historyIndex > 0) {
      newHistoryIndex = get().historyIndex - 1;
    }

    set({
      historyIndex: newHistoryIndex,
      sprite: deepCopySprite(get().history[newHistoryIndex]),
    });
  },
  redo: () => {
    if (get().historyIndex >= get().history.length) return;

    let newHistoryIndex = get().historyIndex;

    if (get().historyIndex < get().history.length - 1) {
      newHistoryIndex = get().historyIndex + 1;
    }

    set({
      historyIndex: newHistoryIndex,
      sprite: deepCopySprite(get().history[newHistoryIndex]),
    });
  },
  save: async (path: string) => {
    const response = await invoke("save", {
      path,
      sprite: JSON.stringify(get().sprite),
    });

    if (response === "success") {
      const newHistory: Sprite[] = [];
      set({
        history: newHistory,
        historyIndex: -1,
        savePath: path,
      });
    }
  },
  savePath: undefined,
  setSavePath: (path: string) => set({ savePath: path }),
}));
