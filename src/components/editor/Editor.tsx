import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { useEffect, useRef } from "react";
import NoSpriteError from "../NoSpriteError";
import { compositeFrame } from "@/lib/composite";
import { copySprite } from "@/lib/utils";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame,
  );

  if (!sprite) return <NoSpriteError />;

  function draw() {
    if (!sprite) return console.error("Sprite is undefined");

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return console.error("Canvas or context is undefined");

    // scale canvas
    const parent = canvas.parentElement?.getBoundingClientRect();
    if (!parent) return console.error("Parent element is undefined");

    const parentSmallestDimension = Math.min(parent.width, parent.height);
    const spriteSmallestDimension = Math.min(sprite.width, sprite.height);
    const scale = Math.max(
      1,
      Math.floor(parentSmallestDimension / spriteSmallestDimension) * 0.95,
    );
    canvas.width = sprite.width * scale;
    canvas.height = sprite.height * scale;

    // draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    for (let i = 0; i < sprite.width; i++) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < sprite.height; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(canvas.width, i * scale);
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
      sprite.width * scale,
      sprite.height * scale,
    );
  }

  useEffect(() => {
    draw();
  }, [sprite, canvasRef.current]);

  useEffect(() => {
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  return (
    <main>
      <canvas width="64" height="64" ref={canvasRef} />
    </main>
  );
}
