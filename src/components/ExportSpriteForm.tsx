import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "./NoSpriteError";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { save } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DialogClose } from "@radix-ui/react-dialog";
import { DialogFooter } from "./ui/dialog";
import { invoke } from "@tauri-apps/api/core";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { compositeFrame } from "@/lib/composite";

function getScaleValues(width: number, height: number): number[] {
  const scale = [1];
  let longest = width > height ? width : height;
  let base = 2;
  let pow = 1;

  while (longest * base ** pow <= 4096) {
    scale.push(base ** pow);
    pow++;
  }

  return scale;
}

enum ExportAs {
  Vertical = "Vertical",
  Horizontal = "Horizontal",
  Multiple = "Multiple",
  Single = "Single",
}

export default function ExportSpriteForm() {
  const [exportPath, setExportPath] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportAs, setExportAs] = useState<ExportAs | null>(null);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);
  const currentFrame = useSpriteStore(
    (state: SpriteState) => state.currentFrame
  );

  if (!sprite) return <NoSpriteError />;

  useEffect(() => {
    if (!sprite || exportAs) return;

    if (sprite.frames.length > 1) {
      setExportAs(ExportAs.Horizontal);
    } else {
      setExportAs(ExportAs.Single);
    }
  }, [sprite]);

  async function handleSubmit() {
    if (!sprite || !exportPath) return;

    setExporting(true);

    setTimeout(async () => {
      try {
        if (exportAs === ExportAs.Single) {
          const composedFrame = compositeFrame(
            sprite.frames[currentFrame],
            sprite.width,
            sprite.height
          );
          invoke("export_sprite", {
            path: exportPath,
            width: sprite.width,
            height: sprite.height,
            scaleFactor: scale,
            pixels: composedFrame.buffer,
          }).then(() => setExporting(false));
        } else if (exportAs === ExportAs.Horizontal) {
          const pixels = new Uint8ClampedArray(
            sprite.width * sprite.height * sprite.frames.length * 4
          );
          const composedFrames = sprite.frames.map(frame =>
            compositeFrame(frame, sprite.width, sprite.height)
          );

          for (let row = 0; row < sprite.height; row++) {
            const frameStartIndex = row * sprite.width * 4;
            const frameLength = sprite.width * 4;
            const frameEndIndex = frameStartIndex + frameLength;

            for (
              let frameIndex = 0;
              frameIndex < composedFrames.length;
              frameIndex++
            ) {
              const frame = composedFrames[frameIndex];

              const destinationOffset =
                row * (sprite.width * composedFrames.length * 4) +
                frameIndex * frameLength;

              pixels.set(
                frame.subarray(frameStartIndex, frameEndIndex),
                destinationOffset
              );
            }
          }

          invoke("export_sprite", {
            path: exportPath,
            width: sprite.width * sprite.frames.length,
            height: sprite.height,
            scaleFactor: scale,
            pixels: pixels.buffer,
          }).then(() => setExporting(false));
        } else if (exportAs === ExportAs.Vertical) {
          const pixels = new Uint8ClampedArray(
            sprite.width * sprite.height * sprite.frames.length * 4
          );
          const composedFrames = sprite.frames.map(frame =>
            compositeFrame(frame, sprite.width, sprite.height)
          );

          for (
            let frameIndex = 0;
            frameIndex < composedFrames.length;
            frameIndex++
          ) {
            const frame = composedFrames[frameIndex];
            const destinationOffset =
              frameIndex * sprite.width * sprite.height * 4;
            pixels.set(frame, destinationOffset);
          }

          invoke("export_sprite", {
            path: exportPath,
            width: sprite.width,
            height: sprite.height * sprite.frames.length,
            scaleFactor: scale,
            pixels: pixels.buffer,
          }).then(() => setExporting(false));
        } else if (exportAs === ExportAs.Multiple) {
          for (const [index, frame] of sprite.frames.entries()) {
            const composedFrame = compositeFrame(
              frame,
              sprite.width,
              sprite.height
            );

            invoke("export_sprite", {
              path: exportPath.replace(".png", `_${index}.png`),
              width: sprite.width,
              height: sprite.height,
              scaleFactor: scale,
              pixels: composedFrame.buffer,
            }).then(() => {
              if (index === sprite.frames.length - 1) {
                setExporting(false);
              }
            });
          }
        }
      } catch (error) {
        console.error("Export failed:", error);
      }
    }, 0);
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-col gap-2">
        <Label>Output Path</Label>
        <div className="flex items-center gap-2">
          <Input
            value={exportPath ?? ""}
            onChange={event => setExportPath(event.target.value)}
          />
          <Button
            onClick={async (event: React.MouseEvent) => {
              event.preventDefault();
              const path = await save({
                defaultPath: `${sprite.name}.png`,
                filters: [
                  {
                    name: "PNG",
                    extensions: ["png"],
                  },
                ],
              });
              if (path) setExportPath(path);
            }}
          >
            Open
          </Button>
        </div>
      </div>
      {sprite.frames.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label>Export As</Label>
          <RadioGroup
            value={exportAs ?? ExportAs.Single}
            onValueChange={value => setExportAs(value as ExportAs)}
            className="flex"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportAs.Single} />
              <Label>
                {sprite.frames.length === 1 ? "Single" : "Current Frame"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportAs.Horizontal} />
              <Label>Horizontal</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportAs.Vertical} />
              <Label>Vertical</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={ExportAs.Multiple} />
              <Label>Multiple</Label>
            </div>
          </RadioGroup>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label>Scale</Label>
        <div className="flex items-center gap-2">
          <Select
            defaultValue={scale.toString()}
            onValueChange={value => {
              console.log("value:", value);
              setScale(parseInt(value));
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getScaleValues(sprite.width, sprite.height).map(value => (
                <SelectItem key={value} value={value.toString()}>
                  {value}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-sm font-mono">
            {sprite.width * scale}px, {sprite.height * scale}px
          </span>
        </div>
      </div>
      <DialogFooter className="flex self-end gap-2">
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={exporting}>
          {exporting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> Exporting...
            </div>
          ) : (
            "Export"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
