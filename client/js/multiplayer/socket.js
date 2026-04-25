import { state } from '../state.js';
export const socket = io();

export function emitStroke(stroke) {
  if (!state.roomCode) return; // not in a room
  socket.emit('stroke-added', {
    roomCode: state.roomCode,
    stroke
  });
}

export function emitErase(ids) {
  if (!state.roomCode) return;
  socket.emit('strokes-erased', {
    roomCode: state.roomCode,
    ids
  });
}