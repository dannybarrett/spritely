import { BrushState, useBrushStore } from "@/stores/brushStore";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "../NoSpriteError";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copySprite, hsbToRgb } from "@/lib/utils";
import { Label } from "../ui/label";

export default function Colors() {
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const color = useBrushStore((state: BrushState) => state.color);
  const altColor = useBrushStore((state: BrushState) => state.altColor);
  const setColor = useBrushStore((state: BrushState) => state.setColor);
  const setAltColor = useBrushStore((state: BrushState) => state.setAltColor);
  const [open, setOpen] = useState(false);

  if (!sprite) return <NoSpriteError />;

  return (
    <section className="flex flex-col gap-2 p-2 border-l">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button variant="outline" size="icon">
            <Plus />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit">
          <ColorSelector setOpen={setOpen} />
        </PopoverContent>
      </Popover>
      {sprite.colors.map((col, index) => (
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

function ColorSelector({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [alpha, setAlpha] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const setSprite = useSpriteStore((state: SpriteState) => state.setSprite);

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
      <div className="flex flex-col gap-0.5">
        <Label className="text-xs">Hue</Label>
        <HueSlider hue={hue} setHue={setHue} />
      </div>
      <div className="flex flex-col gap-0.5">
        <Label className="text-xs">Saturation</Label>
        <SaturationSlider
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          setSaturation={setSaturation}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <Label className="text-xs">Brightness</Label>
        <BrightnessSlider
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          setBrightness={setBrightness}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <Label className="text-xs">Alpha</Label>
        <AlphaSlider
          hue={hue}
          saturation={saturation}
          brightness={brightness}
          alpha={alpha}
          setAlpha={setAlpha}
        />
      </div>
      <Button
        variant="ghost"
        className="border mt-2"
        onClick={() => {
          if (!sprite) return;

          const newSprite = copySprite(sprite);
          const newColor = hsbToRgb(hue, saturation, brightness);
          newSprite.colors.push(
            new Uint8ClampedArray([...newColor, Math.round(alpha * 2.55)])
          );
          setSprite(newSprite);
          setOpen(false);
        }}
      >
        Add Color
      </Button>
    </div>
  );
}

function HueSlider({
  hue,
  setHue,
}: {
  hue: number;
  setHue: (hue: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const hueGradient = ctx.createLinearGradient(
      0,
      0,
      canvasRef.current.width,
      0
    );
    hueGradient.addColorStop(0, "hsl(0, 100%, 50%)"); // Red
    hueGradient.addColorStop(1 / 6, "hsl(60, 100%, 50%)"); // Yellow
    hueGradient.addColorStop(2 / 6, "hsl(120, 100%, 50%)"); // Green
    hueGradient.addColorStop(3 / 6, "hsl(180, 100%, 50%)"); // Cyan
    hueGradient.addColorStop(4 / 6, "hsl(240, 100%, 50%)"); // Blue
    hueGradient.addColorStop(5 / 6, "hsl(300, 100%, 50%)"); // Magenta
    hueGradient.addColorStop(1, "hsl(360, 100%, 50%)"); // Back to Red
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const x = (hue / 360) * canvasRef.current.width;

    ctx.beginPath();
    ctx.arc(x, canvasRef.current.height / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue]);

  function handleMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = event.currentTarget.width;

    const newHue = Math.round((x / width) * 360);
    setHue(newHue);
  }

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={20}
      className="rounded-md"
      onMouseDown={handleMouse}
      onMouseMove={event => {
        if (event.buttons === 1) {
          handleMouse(event);
        }
      }}
    />
  );
}

function SaturationSlider({
  hue,
  saturation,
  brightness,
  setSaturation,
}: {
  hue: number;
  saturation: number;
  brightness: number;
  setSaturation: (saturation: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const saturationGradient = ctx.createLinearGradient(
      0,
      0,
      canvasRef.current.width,
      0
    );
    const desaturatedColor = hsbToRgb(hue, 0, brightness);
    const saturatedColor = hsbToRgb(hue, 100, brightness);
    saturationGradient.addColorStop(
      0,
      `rgb(${desaturatedColor[0]}, ${desaturatedColor[1]}, ${desaturatedColor[2]})`
    );
    saturationGradient.addColorStop(
      1,
      `rgb(${saturatedColor[0]}, ${saturatedColor[1]}, ${saturatedColor[2]})`
    );
    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const x = (saturation / 100) * canvasRef.current.width;

    ctx.beginPath();
    ctx.arc(x, canvasRef.current.height / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, brightness]);

  function handleMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = event.currentTarget.width;

    const newSaturation = Math.round((x / width) * 100);
    setSaturation(newSaturation);
  }

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={20}
      className="rounded-md"
      onMouseDown={handleMouse}
      onMouseMove={event => {
        if (event.buttons === 1) {
          handleMouse(event);
        }
      }}
    />
  );
}

function BrightnessSlider({
  hue,
  saturation,
  brightness,
  setBrightness,
}: {
  hue: number;
  saturation: number;
  brightness: number;
  setBrightness: (brightness: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const brightnessGradient = ctx.createLinearGradient(
      0,
      0,
      canvasRef.current.width,
      0
    );
    const darkColor = hsbToRgb(hue, saturation, 0);
    const brightColor = hsbToRgb(hue, saturation, 100);
    brightnessGradient.addColorStop(
      0,
      `rgb(${darkColor[0]}, ${darkColor[1]}, ${darkColor[2]})`
    );
    brightnessGradient.addColorStop(
      1,
      `rgb(${brightColor[0]}, ${brightColor[1]}, ${brightColor[2]})`
    );
    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const x = (brightness / 100) * canvasRef.current.width;

    ctx.beginPath();
    ctx.arc(x, canvasRef.current.height / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, brightness]);

  function handleMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = event.currentTarget.width;

    const newBrightness = Math.round((x / width) * 100);
    setBrightness(newBrightness);
  }

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={20}
      className="rounded-md"
      onMouseDown={handleMouse}
      onMouseMove={event => {
        if (event.buttons === 1) {
          handleMouse(event);
        }
      }}
    />
  );
}
function AlphaSlider({
  hue,
  saturation,
  brightness,
  alpha,
  setAlpha,
}: {
  hue: number;
  saturation: number;
  brightness: number;
  alpha: number;
  setAlpha: (alpha: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const brightnessGradient = ctx.createLinearGradient(
      0,
      0,
      canvasRef.current.width,
      0
    );
    const color = hsbToRgb(hue, saturation, brightness);
    brightnessGradient.addColorStop(
      0,
      `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`
    );
    brightnessGradient.addColorStop(
      1,
      `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`
    );
    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const x = (alpha / 100) * canvasRef.current.width;

    ctx.beginPath();
    ctx.arc(x, canvasRef.current.height / 2, 6, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, brightness, alpha]);

  function handleMouse(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = event.currentTarget.width;

    const newAlpha = Math.round((x / width) * 100);
    setAlpha(newAlpha);
  }

  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={20}
      className="rounded-md"
      onMouseDown={handleMouse}
      onMouseMove={event => {
        if (event.buttons === 1) {
          handleMouse(event);
        }
      }}
    />
  );
}
