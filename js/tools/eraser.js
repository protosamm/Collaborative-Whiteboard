import { state } from '../state.js';
import { screenToWorld } from '../camera.js';

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
  state.history = state.history.filter(stroke => {
    if (stroke.type === 'rect') {
      let x1, x2, y1, y2;
      if( stroke.startX === Math.min(stroke.startX, stroke.startX + stroke.width)){
        x1 = stroke.startX;
        x2 = stroke.startX + stroke.width;
      } else {
        x1 = stroke.startX + stroke.width;
        x2 = stroke.startX;
      }
      if( stroke.startY === Math.min(stroke.startY, stroke.startY + stroke.height)){
        y1 = stroke.startY;
        y2 = stroke.startY + stroke.height;
      } else {
        y1 = stroke.startY + stroke.height;
        y2 = stroke.startY;
      }
      if (pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2) {
        return false; // remove this rectangle
      }
      return true; // keep this rectangle
    }
    if (stroke.type === 'pen') {
      if (stroke.points.length < 2) {
        if(distance(pos, stroke.points[0]) < 10) {
          return false;
        }
      }
      for (let i = 0; i < stroke.points.length - 1; i++) {
        if (distanceToSegment(pos, stroke.points[i], stroke.points[Math.min(i + 1, stroke.points.length - 1)]) < 10) {
          return false; // remove this stroke
        }
      }
      return true; // keep this stroke
    }
  });
}

export function eraserDown(e, canvas) {
    state.isErasing = true;
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
}

