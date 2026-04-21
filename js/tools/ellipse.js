import { camera, screenToWorld } from "../camera.js";
import { state } from "../state.js";

export function ellipseDown(e, canvas) {
    const pos = screenToWorld(e.clientX, e.clientY);

    state.currentShape = {
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

    const pos = screenToWorld(e.clientX, e.clientY);
    if(state.currentShape) {
        state.currentShape.endX = pos.x;
        state.currentShape.endY = pos.y;
    }
}

export function ellipseUp() {
    if(state.currentShape) {
        const ellipse = state.currentShape;
        state.strokes.push(ellipse);
        state.undoStack.push({
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


