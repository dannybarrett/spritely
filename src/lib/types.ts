export interface Sprite {
  name: string;
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
