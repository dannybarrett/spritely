import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface State {
  frames: [];
  currentFrame: number;
  color: string;
  altColor: string;
  brush: string;
  palette: string[];
}

interface Actions {
  setFrames: (frames: []) => void;
  setCurrentFrame: (frame: number) => void;
  setColor: (color: string) => void;
  setAltColor: (color: string) => void;
  setBrush: (brush: string) => void;
  setPalette: (palette: string[]) => void;
}

export const useStore = create<State & Actions>()(
  immer(set => ({
    frames: [],
    currentFrame: 0,
    color: "#000000",
    altColor: "#FFFFFF",
    brush: "pencil",
    palette: ["#000000", "#FFFFFF"],
    setFrames: frames =>
      set(state => {
        state.frames = frames;
      }),
    setCurrentFrame: frame =>
      set(state => {
        state.currentFrame = frame;
      }),
    setColor: color =>
      set(state => {
        state.color = color;
      }),
    setAltColor: color =>
      set(state => {
        state.altColor = color;
      }),
    setBrush: brush =>
      set(state => {
        state.brush = brush;
      }),
    setPalette: palette =>
      set(state => {
        state.palette = palette;
      }),
  }))
);
