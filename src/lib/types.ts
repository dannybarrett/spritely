export interface Sprite {
  name: string;
  width: number;
  height: number;
  frames: Frame[];
  colors: Uint8ClampedArray[];
}

export interface Frame {
  name: string | undefined;
  layers: Layer[];
}

export interface Layer {
  name: string | undefined;
  pixels: Uint8ClampedArray;
}
