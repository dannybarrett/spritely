export interface Sprite {
  name: string;
  frames: Frame[];
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
