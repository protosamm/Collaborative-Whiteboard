import { state } from "../state.js";
import { camera, screenToWorld } from "../camera.js";

export function lineDown(e, canvas) {
    const pos = screenToWorld(e.clientX, e.clientY);

    state.currentShape = {
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
    const pos = screenToWorld(e.clientX, e.clientY);

    if(state.currentShape) {
        state.currentShape.endX = pos.x;
        state.currentShape.endY = pos.y;
    };
}

export function lineUp() {
    if(state.currentShape) {
        const line = state.currentShape;
        state.strokes.push(line);
        
        state.undoStack.push({
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