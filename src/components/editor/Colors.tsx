import { BrushState, useBrushStore } from "@/stores/brushStore";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { hsbToRgb } from "@/lib/utils";

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
      <Popover>
        <PopoverTrigger>
          <Button variant="outline" size="icon">
            <Plus />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit">
          <ColorSelector />
        </PopoverContent>
      </Popover>
      {colors.map((col, index) => (
        <Button
          key={index}
          variant="outline"
          size="icon"
          onMouseDown={event => {
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

function ColorSelector() {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [alpha, setAlpha] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
    whiteGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    whiteGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = whiteGradient;
    ctx.fillRect(0, 0, width, height);

    const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
    blackGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    blackGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.fillStyle = blackGradient;
    ctx.fillRect(0, 0, width, height);

    const normalizedSaturation = saturation / 100;
    const normalizedBrightness = brightness / 100;

    const x = normalizedSaturation * width;
    const y = height - normalizedBrightness * height;

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, brightness]);

  function handleMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const width = event.currentTarget.width;
    const height = event.currentTarget.height;

    const newSaturation = Math.round(
      Math.max(0, Math.min(100, (x / width) * 100))
    );
    const newBrightness = Math.round(
      Math.max(0, Math.min(100, (1 - y / height) * 100))
    );

    setSaturation(newSaturation);
    setBrightness(newBrightness);
  }

  return (
    <div className="flex flex-col gap-2 w-[250px]">
      <canvas
        ref={canvasRef}
        width={250}
        height={250}
        className="rounded-md"
        onMouseDown={handleMouse}
        onMouseMove={event => {
          if (event.buttons === 1) {
            handleMouse(event);
          }
        }}
      />
      <input
        type="range"
        min="0"
        max="359"
        value={hue}
        onChange={e => setHue(parseInt(e.target.value))}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={saturation}
        onChange={e => setSaturation(parseInt(e.target.value))}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={brightness}
        onChange={e => setBrightness(parseInt(e.target.value))}
      />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={alpha}
        onChange={e => setAlpha(parseFloat(e.target.value))}
      />
    </div>
  );
}
