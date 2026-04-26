import { state } from "../state.js";
import { camera, screenToWorld } from "../camera.js";
import { generateId } from "../utils.js";
import { emitStroke } from "../multiplayer/socket.js";

export function rectDown(e) {
    const pos = screenToWorld(e.clientX, e.clientY);
    const fillColor = state.clipColors ? state.strokeColor : state.fillColor;
    state.currentShape = {
        id: generateId(),
        type: 'rect',
        startX: pos.x,
        startY: pos.y,
        width: 0,
        height: 0,
        stroke: true,
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth / camera.zoom, 
        fill: state.fill,
        fillColor: fillColor
    }
}

export function rectMove(e) {
  if (!state.currentShape) return;
  const pos = screenToWorld(e.clientX, e.clientY);
  
  let width = pos.x - state.currentShape.startX;
  let height = pos.y - state.currentShape.startY;

  if (e.shiftKey) {
    const size = Math.max(Math.abs(width), Math.abs(height));
    width = width < 0 ? -size : size;
    height = height < 0 ? -size : size;
  }

  state.currentShape.width = width;
  state.currentShape.height = height;
}

export function rectUp() {
    if(state.currentShape) {
        const rect = state.currentShape;
        state.strokes.push(rect);
        emitStroke(rect);
        state.undoStack.push({
            type: 'add',
            stroke: rect,    
            strokeId: rect.id,
            undo: () => state.strokes.splice(state.strokes.indexOf(rect), 1),
            redo: () => state.strokes.push(rect)
        })
        state.redoStack = [];
        state.currentShape = null;
    }
}

export function drawRect(ctx, rect) {
  ctx.beginPath();
  ctx.roundRect(rect.startX, rect.startY, rect.width, rect.height, 0);
  if (rect.stroke) {
    ctx.lineWidth = rect.strokeWidth;
    ctx.strokeStyle = rect.strokeColor;
    ctx.stroke();
  }
  if (rect.fill) {
    ctx.fillStyle = rect.fillColor;
    ctx.fill();
  }
}