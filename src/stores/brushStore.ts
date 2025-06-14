import { create } from "zustand";

export const useBrushStore = create(set => ({
  brush: "pencil",
  setBrush: (b: string) => set({ brush: b }),
}));
