import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Frame, Layer } from "@/types/sprite";
import { useEffect, useRef } from "react";

export default function Frames() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  if (!sprite) return "no sprite!";

  return (
    <section className="p-2 border-t min-h-[120px]">
      {sprite.frames.map((frame, index) => (
        <FrameContainer key={`frame_${index}`} frame={frame} index={index} />
      ))}
    </section>
  );
}

function FrameContainer({ frame, index }: { frame: Frame; index: number }) {
  return (
    <div>
      {frame.layers.map((layer, lIndex) => (
        <LayerButton key={`frame_${index}_${lIndex}`} layer={layer} />
      ))}
    </div>
  );
}

function LayerButton({ layer }: { layer: Layer }) {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const history = useSpriteStore((state: SpriteState) => state.history);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!sprite || !canvas || !context) {
      return console.error("Couldn't render preview thumbnail");
    }

    const aspectRatio = sprite.width / sprite.height;
    canvas.width = canvas.height * aspectRatio;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const pixels = layer.pixels;
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
      canvas.width,
      canvas.height
    );
  }, [sprite, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      className="bg-neutral-800"
    ></canvas>
  );
}
