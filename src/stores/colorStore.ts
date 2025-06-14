import { create } from "zustand";

export const useColorStore = create(set => ({
  color: "#000000",
  altColor: "#ffffff",
  palette: ["#000000", "#ffffff"],
  setColor: (c: string) => set({ color: c }),
  setAltColor: (c: string) => set({ altColor: c }),
  setPalette: (newPalette: string[]) => set({ palette: newPalette }),
}));
