import { useColorStore } from "@/stores/colorStore";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export default function Colors() {
  const color = useColorStore((state: any) => state.color);
  const setColor = useColorStore((state: any) => state.setColor);
  const altColor = useColorStore((state: any) => state.color);
  const setAltColor = useColorStore((state: any) => state.setColor);
  const palette = useColorStore((state: any) => state.palette);
  const setPalette = useColorStore((state: any) => state.setPalette);

  return (
    <div className="p-2 h-full border-l">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="icon">
          <Plus />
        </Button>
        {palette.map((c: string, i: number) => (
          <Button
            key={c + i}
            size="icon"
            variant="outline"
            style={{ backgroundColor: c }}
            onMouseDown={event => {
              if (event.buttons === 1) setColor(c);
              if (event.buttons === 2) setAltColor(c);
            }}
          ></Button>
        ))}
      </div>
    </div>
  );
}
