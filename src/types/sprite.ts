export interface Sprite {
  name: string;
  width: number;
  height: number;
  frames: Frame[];
  colors: Pixel[];
}

export interface Frame {
  layers: Layer[];
}

export interface Layer {
  pixels: Pixel[];
  visible: boolean;
}

export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}
