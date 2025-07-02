import { create } from "zustand";
import { Frame, Layer, Pixel, Sprite } from "../types/sprite";
import { invoke } from "@tauri-apps/api/core";

interface History {
  prev: Sprite[];
  next: Sprite[];
}

export interface SpriteState {
  sprite: Sprite | undefined;
  setSprite: (newSprite: Sprite | undefined) => void;
  brush: string;
  setBrush: (newBrush: string) => void;
  color: Pixel;
  setColor: (newColor: Pixel) => void;
  altColor: Pixel;
  setAltColor: (newColor: Pixel) => void;
  history: History;
  setHistory: (newHistory: History) => void;
  undo: () => void;
  redo: () => void;
  save: (path: string) => void;
  savePath: string | undefined;
  setSavePath: (path: string | undefined) => void;
  open: (path: string) => void;
  currentFrame: number;
  setCurrentFrame: (index: number) => void;
  currentLayer: number;
  setCurrentLayer: (index: number) => void;
  addFrame: () => void;
  addLayer: () => void;
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
  setSprite: (newSprite: Sprite | undefined) => {
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
  setHistory: (newHistory: History) => set({ history: newHistory }),
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
    try {
      await invoke("save", {
        path,
        sprite: JSON.stringify(get().sprite),
      });
    } catch (error) {
      console.error("Error saving file");
    }

    set({
      history: {
        prev: [],
        next: [],
      },
      savePath: path,
    });
  },
  savePath: undefined,
  setSavePath: (path: string | undefined) => set({ savePath: path }),
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
  currentFrame: 0,
  setCurrentFrame: (index: number) => set({ currentFrame: index }),
  currentLayer: 0,
  setCurrentLayer: (index: number) => set({ currentLayer: index }),
  addFrame: () => {
    if (!get().sprite) return;

    const currentSprite = get().sprite as Sprite;

    const newSprite = deepCopySprite(currentSprite);
    const layerCount = newSprite.frames[0].layers.length;
    const blankLayer: Layer = {
      pixels: Array.from(
        { length: currentSprite.width * currentSprite.height },
        () => ({
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        })
      ),
      visible: true,
    };

    const newFrame: Frame = {
      layers: Array.from({ length: layerCount }, () => ({ ...blankLayer })),
    };

    newSprite.frames.push(newFrame);

    set({
      sprite: newSprite,
    });
  },
  addLayer: () => {
    if (!get().sprite) return;

    const currentSprite = get().sprite as Sprite;
    const newSprite = deepCopySprite(currentSprite);
    const blankLayer: Layer = {
      pixels: Array.from(
        { length: currentSprite.width * currentSprite.height },
        () => ({
          r: 0,
          g: 0,
          b: 0,
          a: 0,
        })
      ),
      visible: true,
    };

    newSprite.frames.forEach(frame => frame.layers.push({ ...blankLayer }));
    set({ sprite: newSprite });
  },
}));
