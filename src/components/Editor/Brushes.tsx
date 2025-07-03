import { Eraser, PaintBucket, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { SpriteState, useSpriteStore } from "@/stores/spriteStore";
import { useEffect } from "react";

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
    {
      name: "fill",
      key: "g",
      icon: <PaintBucket />,
    },
  ];

  function handleInput(event: KeyboardEvent) {
    const foundBrush = brushes.find(brush => brush.key === event.key);

    if (foundBrush) {
      setBrush(foundBrush.name);
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleInput);

    return () => document.removeEventListener("keydown", handleInput);
  }, []);

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
