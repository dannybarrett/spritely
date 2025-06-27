import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Button } from "../ui/button";

export default function Colors() {
  const colors = useSpriteStore((state: SpriteState) => state.sprite?.colors);
  const color = useSpriteStore((state: SpriteState) => state.color);
  const setColor = useSpriteStore((state: SpriteState) => state.setColor);
  const altColor = useSpriteStore((state: SpriteState) => state.altColor);
  const setAltColor = useSpriteStore((state: SpriteState) => state.setAltColor);

  return (
    <section className="border-l p-2">
      <div className="grid grid-cols-2 gap-2">
        {colors &&
          colors.map(c => (
            <Button
              variant="outline"
              size="icon"
              style={{
                background: `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`,
              }}
              onMouseDown={event => {
                if (event.buttons === 1) {
                  setColor(c);
                }
                if (event.buttons === 2) {
                  setAltColor(c);
                }
              }}
              className="relative z-10 border-none"
            >
              {c === color && (
                <div className="border border-neutral-600 border-t-0 bg-neutral-800 w-2/5 h-2/5 absolute top-0 left-0 rounded-tl-sm border-l-0" />
              )}
              {c === altColor && (
                <div className="border border-neutral-600 border-t-0 bg-neutral-800 w-2/5 h-2/5 absolute top-0 right-0 rounded-tr-sm border-r-0" />
              )}
            </Button>
          ))}
      </div>
    </section>
  );
}
