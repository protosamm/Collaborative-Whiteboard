import { camera, screenToWorld } from "../camera.js";
import { state } from "../state.js";
import { generateId } from '../utils.js';
import { emitStroke } from '../multiplayer/socket.js'

export function ellipseDown(e, canvas) {
    const pos = screenToWorld(e.clientX, e.clientY);

    state.currentShape = {
        id: generateId(),
        type : 'ellipse',
        startX : pos.x,
        startY : pos.y,
        endX : pos.x,
        endY : pos.y,
        stroke : true,
        strokeColor : state.strokeColor,
        strokeWidth : state.strokeWidth / camera.zoom,
        fill : state.fill,
        fillColor : state.fillColor
    }
}

export function ellipseMove(e, canvas) {
  if (!state.currentShape) return;
  const pos = screenToWorld(e.clientX, e.clientY);

  let endX = pos.x;
  let endY = pos.y;

  if (e.shiftKey) {
    const width = pos.x - state.currentShape.startX;
    const height = pos.y - state.currentShape.startY;
    const size = Math.max(Math.abs(width), Math.abs(height));
    endX = state.currentShape.startX + (width < 0 ? -size : size);
    endY = state.currentShape.startY + (height < 0 ? -size : size);
  }

  state.currentShape.endX = endX;
  state.currentShape.endY = endY;
}

export function ellipseUp() {
    if(state.currentShape) {
        const ellipse = state.currentShape;
        state.strokes.push(ellipse);
        emitStroke(ellipse);
        state.undoStack.push({
            type: 'add',
            stroke: ellipse,    
            strokeId: ellipse.id,
            undo: () => state.strokes.splice(state.strokes.indexOf(ellipse), 1),
            redo: () => state.strokes.push(ellipse)
        });
        state.redoStack = [];
        state.currentShape = null;
    }
}

export function drawEllipse(ctx, ellipse) {
    ctx.beginPath();
    ctx.ellipse(
        (ellipse.startX + ellipse.endX) / 2, 
        (ellipse.startY + ellipse.endY) / 2, 
        Math.abs(ellipse.endX - ellipse.startX) / 2, 
        Math.abs(ellipse.endY - ellipse.startY) / 2, 
        0, 0, 2 * Math.PI
    );
    if (ellipse.stroke) {
    ctx.lineWidth = ellipse.strokeWidth;
    ctx.strokeStyle = ellipse.strokeColor;
    ctx.stroke();
  }
  if (ellipse.fill) {
    ctx.fillStyle = ellipse.fillColor;
    ctx.fill();
  }
}


