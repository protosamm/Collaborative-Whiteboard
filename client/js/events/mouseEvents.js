import { dynamicCanvas, staticCanvas } from '../canvas.js';
import { renderDynamic, renderStatic } from '../renderer.js';
import { camera, screenToWorld } from '../camera.js';
import { state } from '../state.js';
import { penDown, penMove, penUp} from '../tools/pen.js';
import { eraserDown, eraserMove, eraserUp } from '../tools/eraser.js';
import { rectDown, rectMove, rectUp } from '../tools/rect.js';
import { lineDown, lineMove, lineUp } from '../tools/line.js';
import { ellipseDown, ellipseMove, ellipseUp } from '../tools/ellipse.js';
import { updateZoomDisplay } from './ui.js';
import { emitCursor } from '../multiplayer/cursors.js';

const crosshair = document.getElementById('crosshair');

let isPanning = false;
let panStart = { x: 0, y: 0 };

function isPanTrigger(e) {
  return e.button === 1 || state.isSpaceDown;
}

export function initMouseEvents() {
    dynamicCanvas.addEventListener('mousedown', e => {
      if (isPanTrigger(e)) {
        isPanning = true;
        panStart.x = e.clientX - camera.x;
        panStart.y = e.clientY - camera.y;
        dynamicCanvas.style.cursor = 'grabbing';
        e.preventDefault();
        return; // don't pass pan clicks to tools
      }
    
      handlePointerDown(e);
    });
    
    window.addEventListener('mousemove', e => {
      handlePointerMove(e);      
    });
    
    window.addEventListener('mouseup', e => {
      if (isPanning) {
        isPanning = false;
        dynamicCanvas.style.cursor = state.isSpaceDown ? 'grab' : 'none';
        return;
      }
    
      handlePointerUp(e);
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
      
      updateZoomDisplay();
      renderDynamic();
      renderStatic();
    }, { passive: false });

    // --- functions ---

    function handlePointerDown(e){
      if (e.button === 0) { // left click only
        switch(state.tool) {
          case 'pen':
            penDown(e, dynamicCanvas);
            renderDynamic();
            break;
          case 'line':
            lineDown(e, dynamicCanvas);
            renderDynamic();
            break;
          case 'eraser':
            eraserDown(e, staticCanvas);
            renderStatic();
            break;
          case 'rect':
            rectDown(e, dynamicCanvas);
            renderDynamic();
            break; 
          case 'ellipse':
            ellipseDown(e, dynamicCanvas);
            renderDynamic();
            break;
        }
      }
    }

    function handlePointerMove(e){
      crosshair.style.left = e.clientX + 'px';
      crosshair.style.top = e.clientY + 'px';

      if (isPanning) {
        camera.x = e.clientX - panStart.x;
        camera.y = e.clientY - panStart.y;
        
        renderDynamic();
        renderStatic();
        return;
      }
      
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      const pos = screenToWorld(state.mouseX, state.mouseY);
      emitCursor(pos.x, pos.y);
      
      switch(state.tool) {
        case 'line':
          lineMove(e, dynamicCanvas);
          break;
        case 'pen':
          penMove(e, dynamicCanvas);
          break;
        case 'eraser':
          eraserMove(e, staticCanvas);
          renderStatic();
          break;
        case 'rect':
          rectMove(e, dynamicCanvas);
          break; 
        case 'ellipse':
          ellipseMove(e, dynamicCanvas);
          break;
      }

      renderDynamic();
    }
  
    function handlePointerUp(e){
      switch(state.tool) {
        case 'line':
          lineUp();
          break;
        case 'pen':
          penUp();
          break;
        case 'eraser':
          eraserUp();
          break;
        case 'rect':
          rectUp();
          break; 
        case 'ellipse':
          ellipseUp();
          break;
      }

      renderDynamic();
      renderStatic();
    }
    
  // --------------- Touch Events for Mobile ---------------
  
  let lastPinchDistance = 0;
  let lastPinchMid = { x: 0, y: 0 };
  let isPinching = false;

  dynamicCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    
    if (e.touches.length === 1) {            // single finger — treat as mousedown
      const mouse = touchToMouse(e.touches[0]);
      handlePointerDown(mouse);
    }

    if (e.touches.length === 2) {
      isPinching = true;
      cancelCurrentAction(); // stop current drawing when starting pinch
      lastPinchDistance = pinchDistance(e);
      lastPinchMid = pinchMidpoint(e);
    }
  }, { passive: false });

  dynamicCanvas.addEventListener('touchmove', e => {
    e.preventDefault();

    if (e.touches.length === 1 && !isPinching) { // single finger move
      handlePointerMove(touchToMouse(e.touches[0]));
    }

    if (e.touches.length === 2) {
      const currentDistance = pinchDistance(e);
      const currentMid = pinchMidpoint(e);

      // zoom
      const zoomFactor = currentDistance / lastPinchDistance;
      const prevZoom = camera.zoom;
      camera.zoom *= zoomFactor;
      camera.zoom = Math.min(Math.max(camera.zoom, 0.01), 50);
      const actualFactor = camera.zoom / prevZoom;

      // pan toward midpoint
      camera.x = currentMid.x - (lastPinchMid.x - camera.x) * actualFactor;
      camera.y = currentMid.y - (lastPinchMid.y - camera.y) * actualFactor;

      // update for next frame
      lastPinchDistance = currentDistance;
      lastPinchMid = currentMid;

      updateZoomDisplay();
      renderStatic();
      renderDynamic();
    }
  }, { passive: false });

  dynamicCanvas.addEventListener('touchend', e => {
    e.preventDefault();

    if (e.touches.length === 0) {
      // all fingers lifted
      isPinching = false;
      handlePointerUp(touchToMouse(e.changedTouches[0]));
    }

    if (e.touches.length === 1) {
      // one finger lifted during pinch — reset to single finger
      isPinching = false;
      lastPinchDistance = 0;
    }
  }, { passive: false });
  
  function touchToMouse(touch) {
    return {
      clientX: touch.clientX,
      clientY: touch.clientY,
      button: 0, // always left click for touch
    };
  }

  // distance between two touch points
  function pinchDistance(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // midpoint between two touch points
  function pinchMidpoint(e) {
    return {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    };
  }
}


// ---- to cancel draw when piching ----
function cancelCurrentAction() {
  state.currentStroke = null;
  state.currentShape = null;
  renderDynamic();
}

