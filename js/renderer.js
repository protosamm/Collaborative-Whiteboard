import { dynamicCanvas, dynamicCtx, staticCanvas, staticCtx } from './canvas.js';
import { applyCameraTransform } from './camera.js';
import { drawGrid } from './grid.js';
import { state } from './state.js';
import { drawRect } from './tools/rect.js';
import { drawStroke } from './tools/pen.js';
import { drawLine } from './tools/line.js';
import { drawEllipse } from './tools/ellipse.js';

export function renderDynamic() {
    dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
    dynamicCtx.save();
    applyCameraTransform(dynamicCtx);
    
    if (state.currentShape) {
        switch(state.currentShape.type) {
            case 'line':
                drawLine(dynamicCtx, state.currentShape);
                break;
            case 'rect':
                drawRect(dynamicCtx, state.currentShape);
                break;
            case 'ellipse':
                drawEllipse(dynamicCtx, state.currentShape);
                break;
        }
    }
    if (state.currentStroke){
        drawStroke(dynamicCtx, state.currentStroke);
    }

    dynamicCtx.restore();

    renderCursor(dynamicCtx);
}

export function renderStatic() {
    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
    staticCtx.save();

    applyCameraTransform(staticCtx);

    drawGrid(staticCtx, staticCanvas.width, staticCanvas.height);

    for (const item of state.strokes){
        drawItem(staticCtx, item);
    }

    staticCtx.restore();

}



function drawItem(ctx, item) {
    ctx.save();
    switch(item.type) {
        case 'line':
            drawLine(ctx, item);
            break;
        case 'pen':
            drawStroke(ctx, item);
            break;
        case 'rect':
            drawRect(ctx, item);
            break;
        case 'ellipse':
            drawEllipse(ctx, item);
            break;
    }
    ctx.restore();
}

export function renderCursor(ctx) {

    ctx.beginPath();
    ctx.arc(state.mouseX, state.mouseY, state.strokeWidth/2, 0, Math.PI * 2);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
}