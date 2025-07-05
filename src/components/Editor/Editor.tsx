import { fill, getLayerComposite } from "@/lib/utils";
import {
  deepCopySprite,
  SpriteState,
  useSpriteStore,
} from "@/stores/spriteStore";
import { Pixel } from "@/types/sprite";
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

  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

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

  function getCoordinates(event: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas || !sprite) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = Math.floor(mouseX / spriteScale / canvasScale);
    const y = Math.floor(mouseY / spriteScale / canvasScale);

    // out of bounds
    if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) {
      return null;
    }

    return { x, y };
  }

  function updatePixel(pixels: Pixel[], index: number, color: Pixel) {
    pixels[index] = brush === "eraser" ? { r: 0, g: 0, b: 0, a: 0 } : color;
  }

  function drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    newColor: Pixel
  ) {
    if (!sprite) {
      return;
    }

    const deltaX = Math.abs(endX - startX);
    const deltaY = Math.abs(endY - startY);

    const stepX = startX < endX ? 1 : -1;
    const stepY = startY < endY ? 1 : -1;

    // if deltaX > deltaY, more horizontal
    // if deltaY > deltaX, more vertical
    let errorTerm = deltaX - deltaY;

    let currentX = startX;
    let currentY = startY;

    const newSprite = deepCopySprite(sprite);
    const currentPixels =
      newSprite.frames[currentFrame].layers[currentLayer].pixels;

    while (true) {
      const pixelIndex = currentX + sprite.width * currentY;

      if (
        currentX >= 0 &&
        currentX < sprite.width &&
        currentY >= 0 &&
        currentY < currentPixels.length / newSprite.width
      ) {
        let colorToApply =
          brush === "eraser" ? { r: 0, g: 0, b: 0, a: 0 } : newColor;
        currentPixels[pixelIndex] = colorToApply;
        setSprite(newSprite);

        if (currentX === endX && currentY === endY) {
          break;
        }

        const twoTimesError = 2 * errorTerm;

        if (twoTimesError > -deltaY) {
          errorTerm -= deltaY;
          currentX += stepX;
        }

        if (twoTimesError < deltaX) {
          errorTerm += deltaX;
          currentY += stepY;
        }
      }
    }
  }

  function handleMouseDown(event: React.MouseEvent) {
    if (!sprite) return;

    const coords = getCoordinates(event);
    if (!coords) {
      lastMousePosition.current = null;
      return;
    }

    const { x, y } = coords;
    const pixelIndex = x + sprite.width * y;
    const newSprite = deepCopySprite(sprite);
    const pixels = newSprite.frames[currentFrame].layers[currentLayer].pixels;
    const newColor = event.buttons === 1 ? color : altColor;

    if (brush === "pencil" || brush === "eraser") {
      updatePixel(pixels, pixelIndex, newColor);
      setSprite(newSprite);
      lastMousePosition.current = { x, y };
    } else if (brush === "fill") {
      const oldColor = pixels[pixelIndex];
      fill({
        pixels,
        width: sprite.width,
        height: sprite.height,
        index: pixelIndex,
        oldColor,
        newColor,
      });
      setSprite(newSprite);
      lastMousePosition.current = null;
    }
  }

  function handleMouseMove(event: React.MouseEvent) {
    if (!sprite || !lastMousePosition.current) return;

    if (event.buttons === 1 || event.buttons === 2) {
      const coords = getCoordinates(event);
      if (!coords) {
        lastMousePosition.current = null;
        return;
      }

      const { x: currentX, y: currentY } = coords;
      const { x: lastX, y: lastY } = lastMousePosition.current || coords;

      if (
        (brush === "pencil" || brush === "eraser") &&
        (currentX !== lastX || currentY !== lastY)
      ) {
        const newColor = event.buttons === 1 ? color : altColor;
        drawLine(lastX, lastY, currentX, currentY, newColor);
        lastMousePosition.current = { x: currentX, y: currentY };
      } else if (brush === "fill") {
        lastMousePosition.current = null;
      }
    }
  }

  function handleMouseUp() {
    lastMousePosition.current = null;
  }

  function handleKeys(event: KeyboardEvent) {
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
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", draw);
      document.removeEventListener("mouseup", handleMouseUp);
    };
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{
          scale: canvasScale,
        }}
      ></canvas>
    </div>
  );
}
