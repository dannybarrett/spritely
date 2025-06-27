import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ColorPicker from "@rc-component/color-picker";
import "@rc-component/color-picker/assets/index.css";
import { useState } from "react";
import { Input } from "../ui/input";
import { Sprite } from "@/types/sprite";
import { hexToRgba } from "@/lib/utils";

function ColorSelector({ onAdd }: { onAdd: (c: string) => void }) {
  const [color, setColor] = useState<string>("#ffffff");
  return (
    <div>
      <ColorPicker
        value={color}
        onChange={value => setColor(value.toHexString())}
      />
      <Input value={color} onChange={event => setColor(event.target.value)} />
      <Button onClick={() => onAdd(color)}>Add color</Button>
    </div>
  );
}

export default function Colors() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);
  const color = useSpriteStore((state: SpriteState) => state.color);
  const setColor = useSpriteStore((state: SpriteState) => state.setColor);
  const altColor = useSpriteStore((state: SpriteState) => state.altColor);
  const setAltColor = useSpriteStore((state: SpriteState) => state.setAltColor);

  const [colorSelectorOpen, setColorSelectorOpen] = useState(false);

  if (!sprite) return <>error: no sprite</>;

  return (
    <section className="border-l p-2">
      <div className="grid grid-cols-2 gap-2">
        <Popover open={colorSelectorOpen} onOpenChange={setColorSelectorOpen}>
          <PopoverTrigger>
            <Button variant="outline" size="icon">
              <Plus />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <ColorSelector
              onAdd={(c: string) => {
                setColorSelectorOpen(false);
                const newColor = hexToRgba(c);
                const newSprite: Sprite = {
                  ...sprite,
                  colors: [...sprite.colors, newColor],
                };
                setSprite(newSprite);
              }}
            />
          </PopoverContent>
        </Popover>
        {sprite.colors.map((c, i) => (
          <Button
            key={i}
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
