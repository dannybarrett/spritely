export interface Sprite {
  name: string;
  frames: Frame[];
  colors: Pixel[];
}

export interface Frame {
  layers: Layer[];
}

export interface Layer {
  pixels: Pixel[];
}

export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}
