import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Layer } from "@/lib/types";
import { Button } from "../ui/button";
import { Eye, EyeClosed, EyeOff, Plus, Trash } from "lucide-react";
import { copySprite } from "@/lib/utils";
import { useEffect, useRef } from "react";

export default function Animation() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);

  if (!sprite) return <NoSpriteError />;

  function toggleLayerVisibility(index: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames[0].layers[index].visible =
      !newSprite.frames[0].layers[index].visible;
    setSprite(newSprite);
  }

  function addLayer() {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames.map(frame => {
      frame.layers.push({
        name: undefined,
        pixels: new Uint8ClampedArray(sprite.width * sprite.height * 4),
        visible: true,
      });
    });
    setSprite(newSprite);
  }

  function removeLayer(index: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames.map(frame => {
      frame.layers.splice(index, 1);
    });
    setSprite(newSprite);
  }

  function addFrame() {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames.push({
      name: undefined,
      layers: sprite.frames[0].layers.map(layer => ({
        ...layer,
        pixels: new Uint8ClampedArray(sprite.width * sprite.height * 4),
      })),
    });
    setSprite(newSprite);
  }

  return (
    <section className="grid grid-cols-[auto_1fr] border-t w-full h-1/4 overflow-scroll">
      <aside className="border-r flex flex-col">
        <div className="w-full h-[53px] border-b" />
        {sprite.frames[0].layers.map((layer, index) => (
          <div
            key={`layer-controller-${index}`}
            className="font-mono h-[40px] flex items-end justify-between"
          >
            <Button
              variant="ghost"
              size="icon"
              disabled
              className="disabled:opacity-100 font-mono"
            >
              {index + 1}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleLayerVisibility(index)}
            >
              {layer.visible ? <Eye /> : <EyeClosed />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeLayer(index)}
              disabled={sprite.frames[0].layers.length === 1}
            >
              <Trash />
            </Button>
          </div>
        ))}
        <div className="p-2">
          <Button
            variant="outline"
            className="text-xs"
            onClick={() => addLayer()}
          >
            <Plus /> Add Layer
          </Button>
        </div>
      </aside>
      <div className="flex flex-col w-full">
        <div className="flex items-center border-b">
          {sprite.frames.map((frame, index) => (
            <div
              key={`frame-controller-${index}`}
              className="font-mono w-[40px] h-full grid place-items-center"
            >
              {index + 1}
            </div>
          ))}
          <div className="p-2">
            <Button
              variant="outline"
              className="text-xs"
              onClick={() => addFrame()}
            >
              <Plus /> Add Frame
            </Button>
          </div>
        </div>
        <div className="flex">
          {sprite.frames.map((frame, frameIndex) => (
            <div key={`frame-${frameIndex}`} className="w-[40px] h-full">
              {frame.layers.map((layer, layerIndex) => (
                <LayerCanvas
                  key={`layer-${layerIndex}`}
                  layer={layer}
                  frameIndex={frameIndex}
                  layerIndex={layerIndex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LayerCanvas({
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

  if (!sprite) return;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const imageData = new ImageData(layer.pixels, sprite.width, sprite.height);

    const aspectRatio = sprite.width / sprite.height;
    const width = 32;
    const height = width / aspectRatio;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

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
      width,
      height
    );
  }, [layer]);

  return (
    <div className="p-1 w-[40px] h-[40px] grid place-items-center">
      <canvas
        width={32}
        height={32}
        ref={canvasRef}
        onMouseDown={() => {
          setCurrentFrame(frameIndex);
          setCurrentLayer(layerIndex);
        }}
        className={
          frameIndex === currentFrame && layerIndex === currentLayer
            ? "border border-blue-700"
            : ""
        }
      />
    </div>
  );
}
