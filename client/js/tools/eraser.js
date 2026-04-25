import { state } from '../state.js';
import { screenToWorld } from '../camera.js';
import { emitErase } from '../multiplayer/socket.js';

let erasedStrokes = [];

function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function distanceToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  // t is how far along the segment the closest point is
  // 0 = at point a, 1 = at point b, 0.5 = halfway
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;

  // clamp t so we don't go beyond the endpoints
  t = Math.max(0, Math.min(1, t));

  // closest point on the segment
  const closest = {
    x: a.x + t * dx,
    y: a.y + t * dy
  };

  return distance(p, closest);
}


function eraseAt(pos) {
  const toErase = state.strokes.filter(stroke => {
    if(stroke.type === 'line') {
      if (distanceToSegment(pos, {x: stroke.startX, y: stroke.startY}, {x: stroke.endX, y: stroke.endY}) < 10) {
        return true; // remove this line
      }
      return false; // keep this line
    }

    if (stroke.type === 'rect') {
      const x1 = Math.min(stroke.startX, stroke.startX + stroke.width);
      const x2 = Math.max(stroke.startX, stroke.startX + stroke.width);
      const y1 = Math.min(stroke.startY, stroke.startY + stroke.height);
      const y2 = Math.max(stroke.startY, stroke.startY + stroke.height);

      const innerCheck = (pos.x > x1 && pos.x < x2 && pos.y > y1 && pos.y < y2);
      const outerCheck = (pos.x >= x1 - state.strokeWidth && pos.x <= x2 + state.strokeWidth && pos.y >= y1 - state.strokeWidth && pos.y <= y2 + state.strokeWidth);

      if(stroke.fill) return outerCheck;
      else if(innerCheck) return false;
      else return outerCheck;
    }

    if(stroke.type === 'ellipse') {
      const threshold = state.strokeWidth;
      const cx = (stroke.startX + stroke.endX) / 2;
      const cy = (stroke.startY + stroke.endY) / 2;
      const rx = Math.abs(stroke.endX - stroke.startX) / 2;
      const ry = Math.abs(stroke.endY - stroke.startY) / 2;

      const outer = ((pos.x - cx) / (rx + threshold)) ** 2 + ((pos.y - cy) / (ry + threshold)) ** 2;
      const inner = ((pos.x - cx) / (rx - threshold)) ** 2 + ((pos.y - cy) / (ry - threshold)) ** 2;

      if(stroke.fill) return outer<= 1;
      else return outer <= 1 && inner >= 1;
    }

    if (stroke.type === 'pen') {
      if (stroke.points.length < 2) {
        if(distance(pos, stroke.points[0]) < 10) {
          return true;
        }
      }
      for (let i = 0; i < stroke.points.length - 1; i++) {
        if (distanceToSegment(pos, stroke.points[i], stroke.points[Math.min(i + 1, stroke.points.length - 1)]) < 10) {
          return true; // remove this stroke
        }
      }
      return false; // keep this stroke
    }
  });

  state.strokes = state.strokes.filter(s => !toErase.includes(s));
  erasedStrokes.push(...toErase);
}

export function eraserDown(e, canvas) {
    state.isErasing = true;
    erasedStrokes = [];
    const pos = screenToWorld(e.clientX, e.clientY);
    eraseAt(pos);
}

export function eraserMove(e, canvas) {
    if(state.isErasing === true){
        const pos = screenToWorld(e.clientX, e.clientY);
        eraseAt(pos);
       }
}

export function eraserUp(e, canvas) {
    state.isErasing = false;
    if(erasedStrokes.length === 0) return;

    const removed = [...erasedStrokes];
    const removedIds = removed.map(s => s.id);
    emitErase(removedIds);
    state.undoStack.push({
      type: 'erase',
      removed: [...removed],
      removedIds: removed.map(s => s.id),
      undo: () => removed.forEach(s => state.strokes.push(s)),
      redo: () => removed.forEach(s => state.strokes.splice(state.strokes.indexOf(s), 1))
    });
    state.redoStack = [];
    erasedStrokes = [];
}

