import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Layer } from "@/lib/types";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ChevronFirst,
  ChevronLast,
  Copy,
  Eye,
  EyeClosed,
  Pause,
  Play,
  Plus,
  Trash,
} from "lucide-react";
import { copySprite } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { confirm } from "@tauri-apps/plugin-dialog";

export default function Animation() {
  const [animationDuration, setAnimationDuration] = useState(300);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );
  const setCurrentFrame = useSpriteStore(
    (state: SpriteState) => state.setCurrentFrame
  );
  const currentLayer = useSpriteStore(
    (state: SpriteState) => state.currentLayer
  );
  const setCurrentLayer = useSpriteStore(
    (state: SpriteState) => state.setCurrentLayer
  );

  if (!sprite) return <NoSpriteError />;

  function toggleLayerVisibility(index: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    const newVisibility = !sprite.frames[0].layers[index].visible;
    newSprite.frames.map(frame => {
      frame.layers[index].visible = newVisibility;
    });
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

  function duplicateLayer(index: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames.map(frame => {
      frame.layers.splice(index + 1, 0, frame.layers[index]);
    });
    setSprite(newSprite);
  }

  async function removeLayer(index: number) {
    if (!sprite) return;

    const confirmation = await confirm(
      "Are you sure you want to remove this layer?",
      {
        title: "Remove Layer",
        kind: "warning",
      }
    );

    if (!confirmation) return;

    if (
      currentLayer === index &&
      index === sprite.frames[0].layers.length - 1
    ) {
      setCurrentLayer(Math.max(0, index - 1));
    }

    const newSprite = copySprite(sprite);
    newSprite.frames.map(frame => {
      frame.layers.splice(index, 1);
    });
    setSprite(newSprite);
  }

  function reorderFrame(startIndex: number, endIndex: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    const startFrame = newSprite.frames[startIndex];
    const endFrame = newSprite.frames[endIndex];
    newSprite.frames[startIndex] = endFrame;
    newSprite.frames[endIndex] = startFrame;
    setSprite(newSprite);
  }

  function reorderLayer(startIndex: number, endIndex: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);

    for (const frame of newSprite.frames) {
      const startLayer = frame.layers[startIndex];
      const endLayer = frame.layers[endIndex];
      frame.layers[startIndex] = endLayer;
      frame.layers[endIndex] = startLayer;
    }

    setSprite(newSprite);
  }

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    userSelect: "none",
    background: isDragging ? "hsl(0 0% 8%)" : "hsl(0 0% 4%)",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  function onDragFrameEnd(result: any) {
    if (!result.destination) return;

    reorderFrame(result.source.index, result.destination.index);
  }

  function onDragLayerEnd(result: any) {
    if (!result.destination) return;

    reorderLayer(result.source.index, result.destination.index);
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

  function duplicateFrame(index: number) {
    if (!sprite) return;

    const newSprite = copySprite(sprite);
    newSprite.frames.splice(index + 1, 0, sprite.frames[index]);
    setSprite(newSprite);
  }

  async function removeFrame(index: number) {
    if (!sprite) return;

    const confirmation = await confirm(
      "Are you sure you want to remove this frame?",
      {
        title: "Remove Frame",
        kind: "warning",
      }
    );

    if (!confirmation) return;

    if (currentFrame === index && index === sprite.frames.length - 1) {
      setCurrentFrame(Math.max(0, index - 1));
    }

    const newSprite = copySprite(sprite);
    newSprite.frames.splice(index, 1);
    setSprite(newSprite);
  }

  return (
    <section className="w-full h-1/3 overflow-scroll">
      <div className="grid grid-cols-[33%_34%_33%] items-center px-2 sticky top-0 bg-background border-b h-1/5">
        <div />
        <AnimationPlayer animationDuration={animationDuration} />
        <Input
          value={animationDuration}
          onChange={e => setAnimationDuration(Number(e.target.value))}
          className="w-16 text-end justify-self-end !text-xs font-mono !p-2"
        />
      </div>
      <div className="grid grid-cols-[auto_1fr] border-t w-full h-4/5">
        <aside className="border-r flex flex-col">
          <div className="w-full h-[53px] border-b" />
          <DragDropContext onDragEnd={onDragLayerEnd}>
            <Droppable droppableId="layers">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sprite.frames[0].layers.map((layer, index) => (
                    <Draggable
                      key={`layer-controller-${index}`}
                      draggableId={`layer-controller-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
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
                            onClick={() => duplicateLayer(index)}
                          >
                            <Copy />
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
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="p-2">
            <Button
              variant="outline"
              className="text-xs w-full"
              onClick={() => addLayer()}
            >
              <Plus /> Add Layer
            </Button>
          </div>
        </aside>
        <div className="flex flex-col w-full">
          <DragDropContext onDragEnd={onDragFrameEnd}>
            <div className="flex items-center gap-1 py-1.5 border-b">
              <Droppable droppableId="frames" direction="horizontal">
                {provided => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex overflow-auto"
                  >
                    {sprite.frames.map((_, index) => (
                      <Draggable
                        key={`frame-${index}`}
                        draggableId={`frame-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            className="w-fit"
                          >
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <div
                                  {...provided.dragHandleProps}
                                  className="font-mono text-sm w-[40px] h-[40px] grid place-items-center"
                                >
                                  {index + 1}
                                </div>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem>
                                  <Button
                                    variant="ghost"
                                    onClick={() => duplicateFrame(index)}
                                  >
                                    <Copy /> Duplicate
                                  </Button>
                                </ContextMenuItem>
                                {sprite.frames.length > 1 && (
                                  <ContextMenuItem>
                                    <Button
                                      variant="ghost"
                                      onClick={() => removeFrame(index)}
                                    >
                                      <Trash /> Delete
                                    </Button>
                                  </ContextMenuItem>
                                )}
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <Button onClick={addFrame} variant="outline">
                <Plus /> Add Frame
              </Button>
            </div>
          </DragDropContext>
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
      </div>
    </section>
  );
}

function AnimationPlayer({ animationDuration }: { animationDuration: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const interval = useRef<NodeJS.Timeout>();
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );
  const setCurrentFrame = useSpriteStore(
    (state: SpriteState) => state.setCurrentFrame
  );

  if (!sprite) return;

  useEffect(() => {
    if (isPlaying) {
      interval.current = setInterval(() => {
        const nextFrame =
          currentFrame === sprite.frames.length - 1 ? 0 : currentFrame + 1;
        setCurrentFrame(nextFrame);
      }, animationDuration);
    } else {
      if (interval.current) {
        clearInterval(interval.current);
      }
    }
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [isPlaying, sprite, currentFrame, setCurrentFrame, animationDuration]);

  return (
    <div className="w-full p-2 flex justify-center">
      <Button
        variant="ghost"
        size="icon"
        disabled={currentFrame === 0}
        onClick={() => setCurrentFrame(0)}
      >
        <ChevronFirst />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={currentFrame === 0}
        onClick={() => setCurrentFrame(currentFrame - 1)}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={sprite.frames.length === 1}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={currentFrame === sprite.frames.length - 1}
        onClick={() => setCurrentFrame(currentFrame + 1)}
      >
        <ArrowRight />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={currentFrame === sprite.frames.length - 1}
        onClick={() => setCurrentFrame(sprite.frames.length - 1)}
      >
        <ChevronLast />
      </Button>
    </div>
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
