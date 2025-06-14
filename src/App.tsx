import { useEffect, useRef } from "react";
import "./App.css";
import { drawPixelCanvas } from "./PixelCanvas/main";
import Nav from "./components/Nav";
import Brushes from "./components/Brushes";
import Colors from "./components/Colors";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return console.error("Canvas not found");

    const spriteWidth = 32;
    const spriteHeight = 16;

    // const outerElement = canvas.parentElement?.getBoundingClientRect();

    canvas.width = spriteWidth * 16;
    canvas.height = spriteHeight * 16;

    const ctx = canvas.getContext("2d");
    if (!ctx) return console.error("Failed to get canvas context");

    drawPixelCanvas({
      ctx,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      spriteWidth,
      spriteHeight,
    });
  }, []);

  return (
    <div className="h-screen">
      <Nav />
      <section className="grid grid-cols-[auto_1fr_auto] h-[calc(100%_-_2.25rem)]">
        <Brushes />
        <main className="p-4 flex flex-col items-center justify-center overflow-hidden">
          <canvas
            id="canvas"
            ref={canvasRef}
            className="bg-neutral-800"
            onClick={event => {
              const canvas = canvasRef.current;
              if (!canvas) return console.error("Canvas not found");
              const rect = canvas.getBoundingClientRect();
              const x = Math.floor((event.clientX - rect.left) / 16);
              const y = Math.floor((event.clientY - rect.top) / 16);
              console.log(`Clicked at (${x}, ${y})`);
            }}
          ></canvas>
        </main>
        <Colors />
      </section>
    </div>
  );
}
