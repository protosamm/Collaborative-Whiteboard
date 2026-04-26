import { state } from "../state.js";
import { camera, screenToWorld } from "../camera.js";
import { generateId } from '../utils.js';
import { emitStroke } from "../multiplayer/socket.js";

export function lineDown(e, canvas) {
    const pos = screenToWorld(e.clientX, e.clientY);

    state.currentShape = {
        id: generateId(),
        type: 'line', 
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        strokeColor: state.strokeColor,
        strokeWidth: state.strokeWidth / camera.zoom
    }
}

export function lineMove(e, canvas) {
  if (!state.currentShape) return;
  const pos = screenToWorld(e.clientX, e.clientY);

  if (e.shiftKey) {
    const dx = pos.x - state.currentShape.startX;
    const dy = pos.y - state.currentShape.startY;
    const angle = Math.atan2(dy, dx);
    const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
    const length = Math.sqrt(dx * dx + dy * dy);
    state.currentShape.endX = state.currentShape.startX + Math.cos(snapped) * length;
    state.currentShape.endY = state.currentShape.startY + Math.sin(snapped) * length;
  } else {
    state.currentShape.endX = pos.x;
    state.currentShape.endY = pos.y;
  }
}
export function lineUp() {
    if(state.currentShape) {
        const line = state.currentShape;
        state.strokes.push(line);
        emitStroke(line);
        state.undoStack.push({
            type: 'add',
            stroke: line,    
            strokeId: line.id,
            undo: () => state.strokes.splice(state.strokes.indexOf(line), 1),
            redo: () => state.strokes.push(line)
        })
        state.redoStack = [];
        state.currentShape = null;
    }
}

export function drawLine(ctx, line) {
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.lineWidth = line.strokeWidth
    ctx.strokeStyle = line.strokeColor;
    ctx.stroke();
}