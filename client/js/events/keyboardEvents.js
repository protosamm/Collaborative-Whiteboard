import { dynamicCanvas } from '../canvas.js';
import { renderDynamic, renderStatic } from '../renderer.js';
import { state } from '../state.js';
import { undo, redo } from '../history.js';
import { updateCursor, setActiveTool, setActiveToolIcon } from './ui.js';
import { updateStrokeWidth } from './ui.js';
import { saveDrawing, loadDrawing } from '../fileManager.js';

const strokeColorPicker = document.querySelector('#stroke-color-picker');
const fillColorPicker = document.querySelector('#fill-color-picker');
const toolbarToggle = document.querySelector('#toolbar-toggle');
const strokeWidthDisplay = document.querySelector('#stroke-width-display');

export function initKeyboardEvents() {

    const keymap = {
        // ── GENERAL SHORTCUTS ────────────────────────────
        '[': () => updateStrokeWidth(state.strokeWidth - 1),
        ']': () => updateStrokeWidth(state.strokeWidth + 1),

        'x': () => {
            const tempColor = state.strokeColor;
            state.strokeColor = state.fillColor;
            strokeColorPicker.value = state.strokeColor;
            state.fillColor = tempColor;
            fillColorPicker.value = state.fillColor;
        },

        'n': () => toolbarToggle.click(),

        // ── TOOL SELECTION ───────────────────────────────
        'l': () => { state.tool = 'line'; state.isErasing = false; },
        'p': () => { state.tool = 'pen'; state.isErasing = false; },
        'e': () => { state.tool = 'eraser'; },
        'r': () => { state.tool = 'rect'; state.isErasing = false; },
        'o': () => { state.tool = 'ellipse'; state.isErasing = false; },
    };

    const ctrlKeymap = {
        'z': () => { undo(); renderStatic(); },
        'y': () => { redo(); renderStatic(); },
        's': () => saveDrawing(),
        'o': () => loadDrawing(),
    };

    window.addEventListener('keydown', e => {
        // ignore shortcuts when typing in any input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; 

        // ── SPACE (PAN MODE) ─────────────────────────────
        if (e.code === 'Space') {
            state.isSpaceDown = true;
            dynamicCanvas.style.cursor = 'grab';
            e.preventDefault();
            return;
        }

        // ── CTRL SHORTCUTS ───────────────────────────────
        if (e.ctrlKey) {
            const fn = ctrlKeymap[e.key];
            if (fn) {
                e.preventDefault();
                fn();
            }
            return;
        }

        // ── NORMAL KEYMAP ────────────────────────────────
        const fn = keymap[e.key];
        if (fn) {
            fn();

            // update UI after tool-related changes
            updateCursor();
            setActiveTool();
            setActiveToolIcon();
        }
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            state.isSpaceDown = false;
            dynamicCanvas.style.cursor = 'crosshair';
        }
    });
}