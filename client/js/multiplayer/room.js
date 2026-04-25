import { socket } from './socket.js';
import { state } from '../state.js';
import { renderStatic, renderDynamic } from '../renderer.js';
import { showToast } from '../events/ui.js';

const landingPage = document.getElementById('landing-page');
const whiteboard = document.getElementById('whiteboard');
const roomCodeInput = document.getElementById('room-code-input');
const passwordInput = document.getElementById('room-password-input');
const errorDiv = document.getElementById('landing-error');
const createBtn = document.getElementById('create-room-btn');
const joinBtn = document.getElementById('join-room-btn');

function showError(msg) {
  errorDiv.textContent = msg;
}

function enterWhiteboard() {
  landingPage.classList.add('hidden');
  whiteboard.classList.remove('hidden');
}

// ── CREATE ──────────────────────────────────────────────
createBtn.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim();
  const password = passwordInput.value.trim();

  if (!roomCode) {
    showError('Please enter a room code');
    return;
  }
  showError('');
  socket.emit('create-room', { roomCode, password });
});

// ── JOIN ─────────────────────────────────────────────────
joinBtn.addEventListener('click', () => {
  const roomCode = roomCodeInput.value.trim();
  const password = passwordInput.value.trim();

  if (!roomCode) {
    showError('Please enter a room code');
    return;
  }
  showError('');
  socket.emit('join-room', { roomCode, password });
});

// ── SOCKET RESPONSES ─────────────────────────────────────
socket.on('room-created', ({ roomCode }) => {
  state.roomCode = roomCode;
  state.isHost = true;
  sessionStorage.setItem('room', JSON.stringify({
    roomCode,
    password: passwordInput.value.trim()
  }));
  enterWhiteboard();
});

socket.on('joined-room', ({ roomCode }) => {
  state.roomCode = roomCode;
  state.isHost = false;
  sessionStorage.setItem('room', JSON.stringify({
    roomCode,
    password: passwordInput.value.trim()
  }));
  enterWhiteboard();
});

socket.on('error', ({ message }) => {
  showError(message);
});

socket.on('room-closed', () => {
  showToast('Host disconnected. Room closed.');
  location.reload();
});

socket.on('promoted-to-host', () => {
  state.isHost = true;
  showToast('You are now the host');
});

// host receives request to send board state to new joiner
socket.on('send-board-state', ({ to }) => {
  socket.emit('board-state', {
    to,
    strokes: state.strokes
  });
});

// joiner receives board state from host
socket.on('board-state', ({ strokes }) => {
  state.strokes = strokes;
  state.undoStack = [];
  state.redoStack = [];
  renderStatic();
  renderDynamic();
});

socket.on('stroke-added', ({ stroke }) => {
  state.strokes.push(stroke);
  renderStatic();
});

socket.on('strokes-erased', ({ ids }) => {
  state.strokes = state.strokes.filter(s => !ids.includes(s.id));
  renderStatic();
});

socket.on('connect', () => {
  console.log('socket connected');
  tryAutoRejoin();
});

// FUNCTION
let isAutoRejoining = false;

function tryAutoRejoin() {
  const saved = sessionStorage.getItem('room');
  console.log('tryAutoRejoin — saved:', saved);
  if (!saved) return;

  const { roomCode, password } = JSON.parse(saved);
  console.log('attempting rejoin:', roomCode, password);
  isAutoRejoining = true;
  socket.emit('join-room', { roomCode, password });
}

socket.on('error', ({ message }) => {
  console.log('error received:', message, 'isAutoRejoining:', isAutoRejoining);
  if (isAutoRejoining) {
    // room no longer exists — clear stale session
    sessionStorage.removeItem('room');
    isAutoRejoining = false;
    // show landing page since auto-rejoin failed
    showToast('Previous session expired');
    return;
  }
  // normal error — show in landing page
  showError(message);
});


export function leaveRoom() {
  socket.emit('leave-room', { roomCode: state.roomCode });
  sessionStorage.removeItem('room');
  location.reload();
}