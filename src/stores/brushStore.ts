import { create } from "zustand";

export interface BrushState {
  brush: string;
  setBrush: (brush: string) => void;
  color: Uint8ClampedArray;
  setColor: (color: Uint8ClampedArray) => void;
  altColor: Uint8ClampedArray;
  setAltColor: (color: Uint8ClampedArray) => void;
}

export enum Brush {
  PENCIL = "Pencil",
  ERASER = "Eraser",
  FILL = "Fill",
  LINE = "Line",
  RECTANGLE = "Rectangle",
  RECTANGLE_OUTLINE = "RectangleOutline",
  OVAL = "Oval",
  OVAL_OUTLINE = "OvalOutline",
}

export const useBrushStore = create<BrushState>(set => ({
  brush: Brush.PENCIL,
  setBrush: brush => set({ brush }),
  color: new Uint8ClampedArray([0, 0, 0, 255]),
  setColor: color => set({ color }),
  altColor: new Uint8ClampedArray([255, 255, 255, 255]),
  setAltColor: color => set({ altColor: color }),
}));
