import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { useEffect, useRef } from "react";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  useEffect(() => {
    console.log("sprite", sprite);
    const canvas = canvasRef.current;

    if (!canvas || !sprite) return;
    const parentSize = canvas.parentElement?.getBoundingClientRect();

    console.log("parent", parentSize);
    // parent width = 1024, h = 650;
    // sprite size = 24x16
    const smallestParentSide = Math.min(parent.innerWidth, parent.innerHeight); // biggest side we can have for the finished canvas
    const smallestSpriteSide = Math.min(
      sprite.width || 16,
      sprite.height || 16
    );

    const pixelSize = Math.floor(smallestParentSide / smallestSpriteSide);

    canvas.width = Math.floor(sprite.width * pixelSize * 0.75);
    canvas.height = Math.floor(sprite.height * pixelSize * 0.75);
  }, [canvasRef, sprite]);

  return (
    <div className="h-full w-full grid place-items-center">
      <canvas
        ref={canvasRef}
        width="196"
        height="196"
        className="border"
      ></canvas>
    </div>
  );
}
