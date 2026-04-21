import { camera, screenToWorld } from './camera.js';

export function drawGrid(ctx, canvasWidth, canvasHeight) {
  const BASE_SPACING = 40; // base world-space gap between dots

  let spacing = BASE_SPACING;
  while (spacing * camera.zoom < 20) {
    spacing *= 2; // jump to a larger grid tier
  }

  // Find visible world bounds so we only draw what's on screen
  const topLeft = screenToWorld(0, 0);
  const bottomRight = screenToWorld(canvasWidth, canvasHeight);

  // Snap to grid so dots don't drift as you pan
  const startX = Math.floor(topLeft.x / spacing) * spacing;
  const startY = Math.floor(topLeft.y / spacing) * spacing;

  // Keep dot size visually consistent regardless of zoom
  const dotRadius = 1.5 / camera.zoom;

  ctx.fillStyle = '#b0a898';

  for (let x = startX; x <= bottomRight.x; x += spacing) {
    for (let y = startY; y <= bottomRight.y; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}