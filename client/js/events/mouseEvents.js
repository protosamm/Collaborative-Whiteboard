import { dynamicCanvas, staticCanvas } from '../canvas.js';
import { renderDynamic, renderStatic } from '../renderer.js';
import { camera } from '../camera.js';
import { state } from '../state.js';
import { penDown, penMove, penUp} from '../tools/pen.js';
import { eraserDown, eraserMove, eraserUp } from '../tools/eraser.js';
import { rectDown, rectMove, rectUp } from '../tools/rect.js';
import { lineDown, lineMove, lineUp } from '../tools/line.js';
import { ellipseDown, ellipseMove, ellipseUp } from '../tools/ellipse.js';
import { updateZoomDisplay } from './ui.js';

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
    
      if (e.button === 0) { // left click only
        switch(state.tool) {
          case 'line':
            lineDown(e, dynamicCanvas);
            renderDynamic();
            break;
          case 'pen':
            penDown(e, dynamicCanvas);
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
    });
    
    window.addEventListener('mousemove', e => {
      if (isPanning) {
        camera.x = e.clientX - panStart.x;
        camera.y = e.clientY - panStart.y;
        
        renderDynamic();
        renderStatic();
        return;
      }
      
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      
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
    });
    
    window.addEventListener('mouseup', e => {
      if (isPanning) {
        isPanning = false;
        dynamicCanvas.style.cursor = spaceDown ? 'grab' : 'crosshair';
        return;
      }
    
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
    
}