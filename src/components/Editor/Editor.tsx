import { useRef } from "react";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div className="h-full w-full grid place-items-center">
      <canvas
        ref={canvasRef}
        width="196"
        height="196"
        className="border"
      ></canvas>
    </div>
  );
}
