export function drawPixelCanvas({
  ctx,
  canvasWidth,
  canvasHeight,
  spriteWidth,
  spriteHeight,
}: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  spriteWidth: number;
  spriteHeight: number;
}) {
  const scale = Math.max(canvasWidth, canvasHeight) / Math.max(spriteWidth, spriteHeight);
  console.log("Scale:", scale);
  drawGrid(ctx, canvasWidth, canvasHeight, scale);
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, cellSize: number) {
  ctx.strokeStyle = "#CCCCCC";
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
