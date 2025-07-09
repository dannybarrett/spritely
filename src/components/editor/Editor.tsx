import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { useCallback, useEffect, useRef, useState } from "react";
import NoSpriteError from "../NoSpriteError";
import { compositeFrame } from "@/lib/composite";
import {
  coordinatesToIndex,
  copySprite,
  fill,
  getColorAtIndex,
  setPixel,
} from "@/lib/utils";
import Brushes from "./Brushes";
import { Brush, BrushState, useBrushStore } from "@/stores/brushStore";
import Colors from "./Colors";

export default function Editor() {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame,
  );
  const currentLayer = useSpriteStore(
    (state: SpriteState) => state.currentLayer,
  );
  const brush = useBrushStore((state: BrushState) => state.brush);
  const color = useBrushStore((state: BrushState) => state.color);
  const altColor = useBrushStore((state: BrushState) => state.altColor);

  if (!sprite) return <NoSpriteError />;

  const draw = useCallback(() => {
    if (!sprite) return console.error("Sprite is undefined");

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return console.error("Canvas or context is undefined");

    // scale canvas
    const parent = canvas.parentElement?.getBoundingClientRect();
    if (!parent) return console.error("Parent element is undefined");

    const parentSmallestDimension = Math.min(parent.width, parent.height);
    const spriteSmallestDimension = Math.min(sprite.width, sprite.height);
    const pixelSize = Math.max(
      1,
      Math.floor(parentSmallestDimension / spriteSmallestDimension) * 0.95,
    );
    canvas.width = sprite.width * pixelSize;
    canvas.height = sprite.height * pixelSize;

    setScale(pixelSize);

    // draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for (let i = 0; i < sprite.width; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < sprite.height; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(canvas.width, i * pixelSize);
      ctx.stroke();
    }

    // draw sprite
    const newSprite = copySprite(sprite);
    const composite = compositeFrame(
      newSprite.frames[currentFrame],
      newSprite.width,
      newSprite.height,
    );
    const imageData = new ImageData(
      composite,
      newSprite.width,
      newSprite.height,
    );

    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    if (!tempContext)
      return console.error("Unable to create temporary canvas.");

    tempCanvas.width = sprite.width;
    tempCanvas.height = sprite.height;
    tempContext.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      sprite.width,
      sprite.height,
      0,
      0,
      sprite.width * pixelSize,
      sprite.height * pixelSize,
    );
  }, [sprite, currentFrame, currentLayer, scale]);

  useEffect(() => {
    draw();
  }, [sprite, canvasRef.current]);

  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [draw]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  function getCoordinates(
    event: React.MouseEvent,
  ): { x: number; y: number } | undefined {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / scale);
    const y = Math.floor((event.clientY - rect.top) / scale);
    return { x, y };
  }

  function handleMouseDown(event: React.MouseEvent) {
    const coordinates = getCoordinates(event);
    if (!coordinates || !sprite) return;

    const index = coordinatesToIndex(
      coordinates.x,
      coordinates.y,
      sprite.width,
    );

    const newSprite = copySprite(sprite);
    const pixels = newSprite.frames[currentFrame].layers[currentLayer].pixels;
    let newColor = event.buttons === 1 ? color : altColor;

    if (brush === Brush.FILL) {
      const oldColor = getColorAtIndex(pixels, index);
      fill(
        pixels,
        coordinates.x,
        coordinates.y,
        sprite.width,
        sprite.height,
        oldColor,
        newColor,
      );
    } else {
      newColor =
        brush === Brush.ERASER ? new Uint8ClampedArray([0, 0, 0, 0]) : newColor;
      setPixel(pixels, index, newColor);
    }
    setSprite(newSprite);
    lastMousePosition.current = coordinates;
  }

  function handleMouseMove(event: React.MouseEvent) {
    const coordinates = getCoordinates(event);
    if (
      !coordinates ||
      !sprite ||
      !lastMousePosition.current ||
      (event.buttons !== 1 && event.buttons !== 2) ||
      brush === Brush.FILL
    ) {
      lastMousePosition.current = null;
      return;
    }

    const { x: endX, y: endY } = coordinates;
    const { x: startX, y: startY } = lastMousePosition.current || coordinates;
    let newColor = event.buttons === 1 ? color : altColor;
    newColor =
      brush === Brush.ERASER ? new Uint8ClampedArray([0, 0, 0, 0]) : newColor;
    drawLine(startX, startY, endX, endY, newColor);
    lastMousePosition.current = coordinates;
  }

  function handleMouseUp() {
    lastMousePosition.current = null;
  }

  function drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    newColor: Uint8ClampedArray,
  ) {
    if (!sprite) return;

    const deltaX = Math.abs(endX - startX);
    const deltaY = Math.abs(endY - startY);
    const stepX = startX < endX ? 1 : -1;
    const stepY = startY < endY ? 1 : -1;
    let errorTerm = deltaX - deltaY;
    let x = startX;
    let y = startY;

    const newSprite = copySprite(sprite);
    const pixels = newSprite.frames[currentFrame].layers[currentLayer].pixels;

    while (true) {
      const index = coordinatesToIndex(x, y, sprite.width);

      if (
        x >= 0 &&
        x < sprite.width &&
        y >= 0 &&
        y < pixels.length / sprite.width
      ) {
        setPixel(pixels, index, newColor);
        setSprite(newSprite);

        if (x === endX && y === endY) break;

        const twoTimesError = 2 * errorTerm;

        if (twoTimesError > -deltaY) {
          errorTerm -= deltaY;
          x += stepX;
        }

        if (twoTimesError < deltaX) {
          errorTerm += deltaX;
          y += stepY;
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] w-full h-full">
      <Brushes />
      <main>
        <canvas
          width="64"
          height="64"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      </main>
      <Colors />
    </div>
  );
}
