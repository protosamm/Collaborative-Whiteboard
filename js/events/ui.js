import { renderDynamic, renderStatic } from '../renderer.js';
import { dynamicCanvas, staticCanvas } from '../canvas.js';
import { undo, redo } from '../history.js';
import { state } from '../state.js';

// variables
const toolbarRect = document.querySelector('#toolbar').getBoundingClientRect();
const currentToolButton = document.querySelector('#current-tool');
const tools = document.querySelectorAll('.tool');
const colorPicker = document.querySelector('#color-picker');
const strokeWidthInput = document.querySelector('#stroke-width-display');
const strokeWidthSlider = document.querySelector('#stroke-width-slider');
const undoButton = document.querySelector('#undo');
const redoButton = document.querySelector('#redo');

export function initUI() {
    
    // event listners
    currentToolButton.addEventListener('click', openToolMenu);
    strokeWidthInput.addEventListener('click', openStrokeWidthPopup);

    tools.forEach(tool => {
        tool.addEventListener('click', () => {
            const toolId = tool.id;
            state.tool = toolId;
            updateCursor();
            setActiveTool();
        });
    });

    strokeWidthSlider.addEventListener('input', (e) => {
        state.strokeWidth = e.target.value;
        strokeWidthInput.textContent = state.strokeWidth;
    });

    colorPicker.addEventListener('input', updateColor);
    colorPicker.addEventListener('change', updateColor);

    undoButton.addEventListener('click', () => {
        undo();
        renderStatic();
    });

    redoButton.addEventListener('click', () => {
        redo();
        renderStatic();
    });
}

// functions
function updateColor(e) {
    state.strokeColor = e.target.value;
}

function openToolMenu() {
    const menu = document.querySelector('#tools-popup');
    const rect = currentToolButton.getBoundingClientRect();

    menu.style.top = (rect.top - toolbarRect.top) + 'px';
    menu.classList.toggle('visible');
}

function openStrokeWidthPopup() {
    const popup = document.querySelector('#stroke-width-popup');
    const rect = strokeWidthInput.getBoundingClientRect();

    popup.style.top = (rect.top - toolbarRect.top) + 'px';
    popup.classList.toggle('visible');
}

export function setActiveTool() {
    tools.forEach(tool => {
        if(tool.id === state.tool) {
            tool.classList.add('active');
        }
        else {
            tool.classList.remove('active');
        }
    });

    if(state.tool !== 'eraser') currentToolButton.classList.add('active');
    else currentToolButton.classList.remove('active');
}

export function updateCursor() {
    switch(state.tool) {
        case 'pen':
            dynamicCanvas.style.cursor = 'default';
            break;
        case 'line':
            dynamicCanvas.style.cursor = 'ew-resize';
            break;
        case 'rect':
            dynamicCanvas.style.cursor = 'crosshair';
            break;
        case 'ellipse':
            dynamicCanvas.style.cursor = 'pointer';
            break;
        default:
            dynamicCanvas.style.cursor = 'default';
    }   
}
