import { state } from '../state.js';
import { screenToWorld } from '../camera.js';

// Called when mouse is pressed down on canvas
export function penDown(e, canvas) {
  const pos = screenToWorld(e.clientX, e.clientY);

  // Start a fresh stroke at the mouse position
  state.currentStroke = {
    type: 'pen',
    points: [pos],
    color: state.color,
    width: state.strokeWidth
  };
}

// Called when mouse moves
export function penMove(e, canvas) {
  // Only draw if we have an active stroke (mouse is held down)
  if (!state.currentStroke) return;

  const pos = screenToWorld(e.clientX, e.clientY);
  state.currentStroke.points.push(pos);
}

// Called when mouse is released
export function penUp() {
  if (!state.currentStroke) return;

  // Only save strokes that have at least one point
  if (state.currentStroke.points.length > 0) {
    state.history.push(state.currentStroke);
    state.redoStack = [];
  }

  state.currentStroke = null;
}

// Draw a single stroke onto the canvas context
export function drawStroke(ctx, stroke) {
  if (stroke.points.length < 2) {
    // Just a dot — draw a circle
    const p = stroke.points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, stroke.width /2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  // quadraticCurveTo smooths the line by curving through midpoints
  // instead of drawing harsh straight segments between every point
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
    const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
    ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midX, midY);
    // ctx.arc(midX, midY, stroke.width / 2, 0, Math.PI * 2);                            //Experimental dotting
  }

  // Draw to the last point
  const last = stroke.points[stroke.points.length - 1];
  ctx.lineTo(last.x, last.y);

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}