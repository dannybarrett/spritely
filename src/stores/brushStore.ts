import { create } from "zustand";

export interface BrushState {
  brush: string;
  setBrush: (brush: string) => void;
}

export enum Brush {
  PENCIL = "Pencil",
  ERASER = "Eraser",
  FILL = "Fill",
}

export const useBrushStore = create<BrushState>((set) => ({
  brush: Brush.PENCIL,
  setBrush: (brush) => set({ brush }),
}));
