import { dynamicCanvas, dynamicCtx, staticCanvas, staticCtx } from './canvas.js';
import { camera, applyCameraTransform } from './camera.js';
import { drawGrid } from './grid.js';
import { state } from './state.js';
import { undo, redo } from './history.js';
import { penDown, penMove, penUp, drawStroke } from './tools/pen.js';
import { eraserDown, eraserMove, eraserUp } from './tools/eraser.js';
import { rectDown, rectMove, rectUp, drawRect } from './tools/rect.js';

// ── RENDER ──────────────────────────────────────────────

function renderDynamic() {
    dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
    dynamicCtx.save();
    applyCameraTransform(dynamicCtx);
    
    if (state.tool === 'rect' && state.currentShape) {
        drawRect(dynamicCtx, state.currentShape);
    }
    if ( state.tool === 'pen' && state.currentStroke){
        drawStroke(dynamicCtx, state.currentStroke);
    }

    dynamicCtx.restore();
}

function renderStatic() {
    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
    staticCtx.save();

    applyCameraTransform(staticCtx);

    drawGrid(staticCtx, staticCanvas.width, staticCanvas.height);

    for (const item of state.history){
        if (item.type === 'rect') {
            drawRect(staticCtx, item);
        } 
        if (item.type === 'pen') {
            drawStroke(staticCtx, item);
        }
    }

    staticCtx.restore();

}

// ── RESIZE ──────────────────────────────────────────────

function resize() {
  staticCanvas.width = window.innerWidth;
  staticCanvas.height = window.innerHeight;
  dynamicCanvas.width = window.innerWidth;
  dynamicCanvas.height = window.innerHeight;
  renderDynamic();
  renderStatic();
}

// ── INPUT EVENTS ─────────────────────────────────────────
// All mouse events go through here.
// We check the active tool and delegate to the right handler.

let isPanning = false;
let panStart = { x: 0, y: 0 };
let spaceDown = false;

function isPanTrigger(e) {
  return e.button === 1 || spaceDown;
}

window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    spaceDown = true;
    dynamicCanvas.style.cursor = 'grab';
    e.preventDefault(); // prevent page scroll
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    spaceDown = false;
    dynamicCanvas.style.cursor = 'crosshair';
  }
});

dynamicCanvas.addEventListener('mousedown', e => {
  if (isPanTrigger(e)) {
    isPanning = true;
    panStart.x = e.clientX - camera.x;
    panStart.y = e.clientY - camera.y;
    dynamicCanvas.style.cursor = 'grabbing';
    e.preventDefault();
    return; // don't pass pan clicks to tools
  }

  if (e.button === 0) { // left click only
    if (state.tool === 'pen') {
      penDown(e, dynamicCanvas);
      renderDynamic();
    }
    if (state.tool === 'eraser'){
      eraserDown(e, staticCanvas);
      renderStatic();
    }
    if (state.tool === 'rect') {
      rectDown(e, dynamicCanvas);
      renderDynamic();
    }
  }
});

window.addEventListener('mousemove', e => {
  if (isPanning) {
    camera.x = e.clientX - panStart.x;
    camera.y = e.clientY - panStart.y;
    renderDynamic();
    renderStatic();
    return;
  }

  if (state.tool === 'pen') {
    penMove(e, dynamicCanvas);
    renderDynamic();
  }
  if (state.tool === 'eraser'){
    eraserMove(e, staticCanvas);
    renderStatic();
  } 
  if(state.tool === 'rect') {
    rectMove(e, dynamicCanvas);
    renderDynamic();
  }
});

window.addEventListener('mouseup', e => {
  if (isPanning) {
    isPanning = false;
    dynamicCanvas.style.cursor = spaceDown ? 'grab' : 'crosshair';
    return;
  }

  if (state.tool === 'pen') penUp();
  if (state.tool === 'eraser' ) eraserUp();
  if (state.tool === 'rect') rectUp();
  renderDynamic();
  renderStatic();
});

dynamicCanvas.addEventListener('wheel', e => {
  e.preventDefault();

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const prevZoom = camera.zoom;
  camera.zoom *= zoomFactor;
  camera.zoom = Math.min(Math.max(camera.zoom, 0.01), 50);
  const cx = dynamicCanvas.width / 2;
  const cy = dynamicCanvas.height / 2;

  const actualFactor = camera.zoom / prevZoom;
  camera.x = cx - (cx - camera.x) * actualFactor;
  camera.y = cy - (cy - camera.y) * actualFactor;

  renderDynamic();
  renderStatic();
}, { passive: false });

// ── KEYBOARD SHORTCUT EVENTS ──────────────────────────────────────
window.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'z') {
    // Undo: move last stroke from history to redo stack
    undo();
    renderStatic();
}
if (e.ctrlKey && e.key === 'y') {
    // Redo: move last stroke from redo stack to history
    redo();
    renderStatic();
  }
});

window.addEventListener('keydown', e=>{
  switch(e.key){
    case 'p':
      state.tool = 'pen';
      state.isErasing = false;
      dynamicCanvas.style.cursor = 'crosshair';
      renderStatic();
      break;
    case 'e':
      state.tool = 'eraser';
      dynamicCanvas.style.cursor = 'pointer';
      renderStatic();
      break;
    case 'r':
      state.tool = 'rect';
      dynamicCanvas.style.cursor = 'default';
      renderStatic();
      break;
  };
})

// ── INIT ─────────────────────────────────────────────────
window.addEventListener('resize', resize);
resize();