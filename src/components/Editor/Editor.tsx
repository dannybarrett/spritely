import { fill, getLayerComposite } from "@/lib/utils";
import {
  deepCopySprite,
  SpriteState,
  useSpriteStore,
} from "@/stores/spriteStore";
import { useEffect, useRef, useState } from "react";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const brush = useSpriteStore((state: SpriteState) => state.brush);
  const color = useSpriteStore((state: SpriteState) => state.color);
  const altColor = useSpriteStore((state: SpriteState) => state.altColor);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );
  const currentLayer = useSpriteStore(
    (state: SpriteState) => state.currentLayer
  );
  const [spriteScale, setSpriteScale] = useState(16);
  const [canvasScale, setCanvasScale] = useState(1);

  function draw() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context || !sprite) {
      return;
    }

    // scale canvas
    const parent = canvas.parentElement?.getBoundingClientRect();
    if (!parent) {
      return;
    }

    const parentSmallestDimension = Math.min(parent.width, parent.height);
    const spriteSmallestDimension = Math.min(sprite.width, sprite.height);
    const scale = Math.max(
      1,
      Math.floor(parentSmallestDimension / spriteSmallestDimension) * 0.95
    );
    canvas.width = sprite.width * scale;
    canvas.height = sprite.height * scale;
    setSpriteScale(scale);

    canvas.style.scale = canvasScale.toString();

    // draw grid
    context.strokeStyle = "#444444";
    context.lineWidth = 1;

    for (let x = 0; x < sprite.width; x++) {
      context.beginPath();
      context.moveTo(x * scale, 0);
      context.lineTo(x * scale, sprite.height * scale);
      context.stroke();
    }

    for (let y = 0; y < sprite.height; y++) {
      context.beginPath();
      context.moveTo(0, y * scale);
      context.lineTo(sprite.width * scale, y * scale);
      context.stroke();
    }

    // draw sprite
    const pixels = getLayerComposite(
      sprite.frames[currentFrame].layers,
      sprite.width,
      sprite.height
    );

    const u8Pixels = new Uint8Array(pixels.length * 4);

    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      const index = i * 4;

      u8Pixels[index] = pixel.r;
      u8Pixels[index + 1] = pixel.g;
      u8Pixels[index + 2] = pixel.b;
      u8Pixels[index + 3] = pixel.a;
    }

    const imageData = new ImageData(
      new Uint8ClampedArray(u8Pixels.buffer),
      sprite.width,
      sprite.height
    );
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    if (!tempContext) {
      return console.error("Unable to create temporary canvas.");
    }

    tempCanvas.width = sprite.width;
    tempCanvas.height = sprite.height;
    tempContext.putImageData(imageData, 0, 0);

    context.imageSmoothingEnabled = false;
    context.drawImage(
      tempCanvas,
      0,
      0,
      sprite.width,
      sprite.height,
      0,
      0,
      sprite.width * scale,
      sprite.height * scale
    );
  }

  function handleInput(event: React.MouseEvent) {
    if (!sprite) return;
    if (event.buttons === 1 || event.buttons === 2) {
      const canvas = canvasRef.current;
      if (!canvas) return console.error("Canvas not found");
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const x = Math.floor(mouseX / spriteScale / canvasScale);
      const y = Math.floor(mouseY / spriteScale / canvasScale);
      // console.log(`Clicked at (${x}, ${y})`);

      // out of bounds
      if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) {
        return;
      }

      const index = x + sprite.width * y;
      let newColor = event.buttons === 1 ? color : altColor;
      const newSprite = deepCopySprite(sprite);

      if (brush === "pencil") {
        newSprite.frames[currentFrame].layers[currentLayer].pixels[index] =
          newColor;

        setSprite(newSprite);
      }

      if (brush === "eraser") {
        newColor = { r: 0, g: 0, b: 0, a: 0 };
        newSprite.frames[currentFrame].layers[currentFrame].pixels[index] =
          newColor;
        setSprite(newSprite);
      }

      if (brush === "fill") {
        const oldColor =
          newSprite.frames[currentFrame].layers[currentLayer].pixels[index];

        fill({
          pixels: newSprite.frames[currentFrame].layers[currentLayer].pixels,
          width: newSprite.width,
          height: newSprite.height,
          index: index,
          oldColor: oldColor,
          newColor: newColor,
        });

        setSprite(newSprite);
      }
    }
  }

  function handleKeys(event: KeyboardEvent) {
    console.log("event", event.key.toLowerCase());
    switch (event.key.toLowerCase()) {
      case "=":
        if (canvasScale < 2) {
          setCanvasScale(prev => prev + 0.1);
        }
        break;
      case "-":
        if (canvasScale > 0.5) {
          setCanvasScale(prev => prev - 0.1);
        }
        break;
    }
  }

  useEffect(() => {
    window.addEventListener("resize", draw);

    return () => window.removeEventListener("resize", draw);
  }, []);

  useEffect(
    () => draw(),
    [canvasRef, sprite, currentFrame, currentLayer, canvasScale]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeys);

    return () => document.removeEventListener("keydown", handleKeys);
  }, []);

  return (
    <div className="h-full w-full grid place-items-center overflow-scroll">
      <canvas
        ref={canvasRef}
        width="196"
        height="196"
        className="border bg-neutral-800"
        onMouseDown={handleInput}
        onMouseOver={handleInput}
        onMouseMove={handleInput}
        style={{
          scale: canvasScale,
        }}
      ></canvas>
    </div>
  );
}
