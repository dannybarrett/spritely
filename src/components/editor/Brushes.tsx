import { Brush, useBrushStore } from "@/stores/brushStore";
import { Eraser, PaintBucket, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect } from "react";

export default function Brushes() {
  const brush = useBrushStore((state) => state.brush);
  const setBrush = useBrushStore((state) => state.setBrush);

  const brushes = [
    {
      name: Brush.PENCIL,
      icon: <Pencil />,
      key: "b",
    },
    {
      name: Brush.ERASER,
      icon: <Eraser />,
      key: "e",
    },
    {
      name: Brush.FILL,
      icon: <PaintBucket />,
      key: "g",
    },
  ];

  function handleInput(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const brush = brushes.find((b) => b.key === key);
    if (brush) setBrush(brush.name);
  }

  useEffect(() => {
    document.addEventListener("keydown", handleInput);
    return () => document.removeEventListener("keydown", handleInput);
  }, []);

  return (
    <div className="flex flex-col gap-2 items-center border-r p-2">
      {brushes.map((b) => (
        <Button
          key={b.name}
          variant="outline"
          size="icon"
          onClick={() => setBrush(b.name)}
          className={`${brush === b.name ? "bg-neutral-700 hover:bg-neutral-700" : ""}`}
        >
          {b.icon}
        </Button>
      ))}
    </div>
  );
}
