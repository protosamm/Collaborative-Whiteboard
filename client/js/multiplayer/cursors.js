import { state } from '../state.js';
import { camera } from '../camera.js';
import { socket } from './socket.js';

let lastCursorEmit = 0;

export function emitCursor(x, y) {
  if (!state.roomCode) return;
  
  const now = Date.now();
  if (now - lastCursorEmit < 50) return; // only emit every 50ms
  lastCursorEmit = now;

  socket.emit('cursor-move', {
    roomCode: state.roomCode,
    x, y
  });
}

export function drawCursors(ctx) {
  Object.entries(state.cursors).forEach(([id, cursor]) => {
    // convert world to screen
    const screenX = cursor.x * camera.zoom + camera.x;
    const screenY = cursor.y * camera.zoom + camera.y;

    const color = idToColor(id);

    // draw cursor triangle
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(screenX + 14, screenY + 12);
    ctx.lineTo(screenX, screenY + 18);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();

   });
}

// turn socket id into a consistent color
function idToColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 60%)`;
}