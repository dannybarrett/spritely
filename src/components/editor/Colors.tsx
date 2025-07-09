import { BrushState, useBrushStore } from "@/stores/brushStore";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Button } from "../ui/button";

export default function Colors() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const color = useBrushStore((state: BrushState) => state.color);
  const altColor = useBrushStore((state: BrushState) => state.altColor);
  const setColor = useBrushStore((state: BrushState) => state.setColor);
  const setAltColor = useBrushStore((state: BrushState) => state.setAltColor);

  if (!sprite) return <NoSpriteError />;

  const colors = sprite.colors;

  return (
    <section className="flex flex-col gap-2 p-2 border-l">
      {colors.map((col, index) => (
        <Button
          key={index}
          variant="outline"
          size="icon"
          onMouseDown={(event) => {
            if (event.buttons === 1) {
              setColor(col);
            } else if (event.buttons === 2) {
              setAltColor(col);
            }
          }}
          style={{
            backgroundColor: `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`,
          }}
          className="relative border-none"
        >
          {col === color && (
            <div className="absolute top-0 left-0 bg-neutral-500 border-neutral-600 border-l-0 border-t-0 text-black rounded-tl-md w-3 h-3"></div>
          )}
          {col === altColor && (
            <div className="absolute top-0 right-0 bg-neutral-500 border-neutral-600 border-r-0 border-t-0 text-black rounded-tr-md w-3 h-3"></div>
          )}
        </Button>
      ))}
    </section>
  );
}
