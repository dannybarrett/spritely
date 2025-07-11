import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Layer } from "@/lib/types";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function Animation() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  if (!sprite) return <NoSpriteError />;

  return (
    <section className="flex border-t w-full h-1/4">
      <aside className="border-r flex flex-col">
        <div className="w-full h-[40px] border-b" />
        {sprite.frames[0].layers.map((layer, index) => (
          <div
            key={`layer-controller-${index}`}
            className="px-2 font-mono h-[40px] grid place-items-center"
          >
            {index}
          </div>
        ))}
        <Button variant="ghost" size="icon">
          <Plus />
        </Button>
      </aside>
      <div className="flex flex-col w-full">
        <div className="flex items-center border-b h-[40px]">
          {sprite.frames.map((frame, index) => (
            <div
              key={`frame-controller-${index}`}
              className="font-mono w-[40px] h-full grid place-items-center"
            >
              {index}
            </div>
          ))}
          <Button variant="ghost" size="icon">
            <Plus />
          </Button>
        </div>
        <div>
          {sprite.frames.map((frame, index) => (
            <div key={`frame-${index}`} className="w-[40px] h-full">
              {frame.layers.map((layer, index) => (
                <LayerCanvas key={`layer-${index}`} layer={layer} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LayerCanvas({ layer }: { layer: Layer }) {
  return (
    <div className="p-1 w-[40px] h-[40px] grid place-items-center">
      <canvas width={32} height={32} />
    </div>
  );
}
