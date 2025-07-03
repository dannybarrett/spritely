import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Frame, Layer } from "@/types/sprite";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Eye, EyeClosed, Pause, Play, Plus } from "lucide-react";
import { Input } from "../ui/input";

export default function Frames() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const addFrame = useSpriteStore((state: SpriteState) => state.addFrame);
  if (!sprite) return "no sprite!";

  return (
    <section className="flex flex-col">
      <AnimationPlayer />
      <div className="border-t h-60 overflow-scroll grid grid-cols-[auto_1fr] gap-2">
        <LayersPanel />
        <div className="flex gap-2 py-2 pr-2">
          {sprite.frames.map((frame, index) => (
            <div className="grid grid-rows-[34px_auto] gap-2">
              <span className="text-xs font-mono text-center self-center">
                {index + 1}
              </span>
              <FrameContainer
                key={`frame_${index}`}
                frame={frame}
                index={index}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => addFrame()}
            className="w-8.25 h-8.25"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </section>
  );
}

function AnimationPlayer() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );
  const setCurrentFrame = useSpriteStore(
    (state: SpriteState) => state.setCurrentFrame
  );
  const [playing, setPlaying] = useState(false);
  const [frameDuration, setFrameDuration] = useState(300);

  let interval: NodeJS.Timeout;

  useEffect(() => {
    if (playing && sprite) {
      interval = setInterval(() => {
        let newFrame = currentFrame + 1;
        if (newFrame > sprite.frames.length - 1) {
          newFrame -= sprite.frames.length;
        }

        setCurrentFrame(newFrame);
      }, frameDuration);
    }

    return () => clearInterval(interval);
  }, [playing, currentFrame, setCurrentFrame, sprite, frameDuration]);

  return (
    <div className="flex justify-center border-t p-2">
      <Button variant="ghost" size="icon" onClick={() => setPlaying(!playing)}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <Input
        type="number"
        defaultValue={frameDuration}
        onChange={event => {
          setFrameDuration(parseInt(event.target.value ?? 300));
        }}
        className="w-20"
      />
    </div>
  );
}

function FrameContainer({ frame, index }: { frame: Frame; index: number }) {
  return (
    <div className="flex flex-col gap-2">
      {frame.layers.map((layer, lIndex) => (
        <LayerButton
          key={`frame_${index}_${lIndex}`}
          layer={layer}
          frameIndex={index}
          layerIndex={lIndex}
        />
      ))}
    </div>
  );
}

function LayersPanel() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const addLayer = useSpriteStore((state: SpriteState) => state.addLayer);
  if (!sprite) return "no sprite";

  const layers = sprite.frames[0].layers;
  return (
    <div className="h-full border-r p-2 flex flex-col items-center gap-2">
      <div className="h-[34px]" />
      {layers.map((layer, index) => (
        <Button
          key={`layerp_${index}`}
          size="icon"
          variant="ghost"
          style={{ width: "34px", height: "34px" }}
        >
          {layer.visible ? <Eye /> : <EyeClosed />}
        </Button>
      ))}
      <Button variant="outline" size="icon" onClick={() => addLayer()}>
        <Plus />
      </Button>
    </div>
  );
}

function LayerButton({
  layer,
  frameIndex,
  layerIndex,
}: {
  layer: Layer;
  frameIndex: number;
  layerIndex: number;
}) {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );
  const currentLayer = useSpriteStore(
    (state: SpriteState) => state.currentLayer
  );
  const setCurrentFrame = useSpriteStore(
    (state: SpriteState) => state.setCurrentFrame
  );
  const setCurrentLayer = useSpriteStore(
    (state: SpriteState) => state.setCurrentLayer
  );
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
      className="bg-neutral-800 rounded-xs"
      style={{
        border:
          currentFrame === frameIndex && currentLayer === layerIndex
            ? "1px solid orange"
            : "1px solid transparent",
      }}
      onClick={() => {
        setCurrentFrame(frameIndex);
        setCurrentLayer(layerIndex);
      }}
    ></canvas>
  );
}
