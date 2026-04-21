import { dynamicCanvas, staticCanvas } from './canvas.js';
import { renderDynamic, renderStatic } from './renderer.js';
import { initMouseEvents } from './events/mouseEvents.js';
import { initKeyboardEvents } from './events/keyboardEvents.js';
import { initUI } from './events/ui.js';

// ── RESIZE ──────────────────────────────────────────────

function resize() {
  staticCanvas.width = window.innerWidth;
  staticCanvas.height = window.innerHeight;
  dynamicCanvas.width = window.innerWidth;
  dynamicCanvas.height = window.innerHeight;
  renderDynamic();
  renderStatic();
}

// ── INPUT EVENTS ────────────────────────────────────────

initMouseEvents();
initKeyboardEvents();
initUI();

// ── INIT ─────────────────────────────────────────────────
window.addEventListener('resize', resize);
resize();