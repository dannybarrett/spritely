import { Frame } from "./types";

export function compositeFrame(
  frame: Frame,
  width: number,
  height: number,
): Uint8ClampedArray {
  // implement later
  return frame.layers[0].pixels;
}
