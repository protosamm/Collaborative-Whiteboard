import { dynamicCanvas } from '../canvas.js';
import { renderStatic } from '../renderer.js';
import { state } from '../state.js';
import { undo, redo } from '../history.js';
import { updateCursor, setActiveTool } from './ui.js';

export function initKeyboardEvents() {
    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            state.isSpaceDown = true;
            dynamicCanvas.style.cursor = 'grab';
            e.preventDefault(); // prevent page scroll
        }
    });

    window.addEventListener('keyup', e => {
        if (e.code === 'Space') {
            state.isSpaceDown = false;
            dynamicCanvas.style.cursor = 'crosshair';
        }
    });


    // ── KEYBOARD SHORTCUT EVENTS ──────────────────────────────────────
    window.addEventListener('keydown', e => {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z': undo(); renderStatic(); break;
                case 'y': redo(); renderStatic(); break;
            }
            return;
        }
        switch (e.key) {
            case '[': state.strokeWidth = Math.max(state.strokeWidth - 1, 1); break;
            case ']': state.strokeWidth = Math.min(state.strokeWidth + 1, 50); break;
        }
                
    });

    // ── TOOL SELECTION SHORTCUTS ──────────────────────────────────────

    window.addEventListener('keydown', e=>{
        switch(e.key){
            case 'l':
                state.tool = 'line';
                state.isErasing = false;
                break;
            case 'p':
                state.tool = 'pen';
                state.isErasing = false;
                break;
            case 'e':
                state.tool = 'eraser';
                break;
            case 'r':
                state.tool = 'rect';
                state.isErasing = false;
                break;
            case 'o':
                state.tool = 'ellipse';
                state.isErasing = false;
                break;
        };
        updateCursor();
        setActiveTool();
    })
}