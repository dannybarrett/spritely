import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Layer } from "@/lib/types";
import { Button } from "../ui/button";

export default function Animation() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  if (!sprite) return <NoSpriteError />;

  return (
    <section className="flex flex-col border-t w-full h-[20vh]">
      <header>
        <Button>Add Frame</Button>
      </header>
      <div className="grid grid-cols-[auto_1fr]">
        <aside className="flex flex-col border-r">
          {sprite.frames[0].layers.map((layer, index) => (
            <div key={`layer-control-${index}`} className="flex">
              {index}
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function LayerCanvas({ layer }: { layer: Layer }) {
  return <canvas width={32} height={32} />;
}
