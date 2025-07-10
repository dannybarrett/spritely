import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import NoSpriteError from "./NoSpriteError";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { save } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DialogClose } from "@radix-ui/react-dialog";
import { DialogFooter } from "./ui/dialog";
import { scaleSprite } from "@/lib/utils";

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

export default function ExportSpriteForm() {
  const [exportPath, setExportPath] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const sprite = useSpriteStore((state: SpriteState) => state.sprite);

  if (!sprite) return <NoSpriteError />;

  function handleSubmit() {
    if (!sprite || !exportPath) return;
    const scaledSprite = scaleSprite(sprite, scale);
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
        <Button onClick={handleSubmit}>Export</Button>
      </DialogFooter>
    </div>
  );
}
