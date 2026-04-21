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
            e.preventDefault();
            switch (e.key) {
                case 'z': undo(); renderStatic(); break;
                case 'y': redo(); renderStatic(); break;
                case 's': saveDrawing(); break;
                case 'o': loadDrawing(); break;
            }
            return;
        }
        switch (e.key) {
            case '[': updateStrokeWidth(state.strokeWidth - 1); break;
            case ']': updateStrokeWidth(state.strokeWidth + 1); break;
            case 'x': {
                const tempColor = state.strokeColor;
                state.strokeColor = state.fillColor;
                strokeColorPicker.value = state.strokeColor;
                state.fillColor = tempColor;
                fillColorPicker.value = state.fillColor;
                break;
            }
            case 'n': {
                toolbarToggle.click();
                break;
            }
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
        setActiveToolIcon();
    })
}