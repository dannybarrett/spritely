import { Eraser, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useBrushStore } from "@/stores/brushStore";
import { useEffect } from "react";

export default function Brushes() {
  const brush = useBrushStore((state: any) => state.brush);
  const setBrush = useBrushStore((state: any) => state.setBrush);

  const brushes = [
    {
      name: "pencil",
      icon: <Pencil />,
      hotkey: "b",
    },
    {
      name: "eraser",
      icon: <Eraser />,
      hotkey: "e",
    },
  ];

  useEffect(() => {
    function handleKeyEvents(event: KeyboardEvent) {
      brushes.forEach(b => {
        if (event.key === b.hotkey) setBrush(b.name);
      });
    }

    document.addEventListener("keydown", handleKeyEvents);
    return () => document.removeEventListener("keydown", handleKeyEvents);
  });

  return (
    <div className="p-2 border-r h-full flex flex-col gap-2">
      {brushes.map(b => (
        <Tooltip key={b.name} delayDuration={500} disableHoverableContent={true}>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBrush(b.name)}
              className={brush === b.name ? "bg-neutral-700" : ""}
            >
              {b.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {b.name} <span className="font-mono">({b.hotkey})</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
