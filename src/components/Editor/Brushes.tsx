import { Eraser, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";

export default function Brushes() {
  const brush = useSpriteStore((state: SpriteState) => state.brush);
  const setBrush = useSpriteStore((state: SpriteState) => state.setBrush);

  const brushes = [
    {
      name: "pencil",
      key: "b",
      icon: <Pencil />,
    },
    {
      name: "eraser",
      key: "e",
      icon: <Eraser />,
    },
  ];

  return (
    <section className="border-r p-2">
      <div className="grid grid-cols-2 gap-2">
        {brushes.map(b => (
          <Button
            key={b.key}
            variant="outline"
            size="icon"
            onClick={() => setBrush(b.name)}
            className={
              brush === b.name ? "bg-neutral-700 hover:bg-neutral-700" : ""
            }
          >
            {b.icon}
          </Button>
        ))}
      </div>
    </section>
  );
}
