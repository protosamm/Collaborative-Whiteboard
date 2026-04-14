import { renderDynamic, renderStatic } from '../renderer.js';
import { dynamicCanvas, staticCanvas } from '../canvas.js';
import { undo, redo } from '../history.js';
import { state } from '../state.js';

// variables
const toolbarRect = document.querySelector('#toolbar').getBoundingClientRect();
const currentToolButton = document.querySelector('#current-tool');
const tools = document.querySelectorAll('.tool');

const fillToggle = document.querySelector('#fill-toggle');
const strokeColorPicker = document.querySelector('#stroke-color-picker');
const fillColorPicker = document.querySelector('#fill-color-picker');
const colorSwap = document.querySelector('#color-swap');
const colorClip = document.querySelector('#color-clip');

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

    // color pickers
    strokeColorPicker.addEventListener('input', updateStrokeColor);
    strokeColorPicker.addEventListener('change', updateStrokeColor);
    fillColorPicker.addEventListener('input', updateFillColor);
    fillColorPicker.addEventListener('change', updateFillColor);

    colorSwap.addEventListener('click', () => {
        const tempColor = state.strokeColor;
        state.strokeColor = state.fillColor;
        strokeColorPicker.value = state.strokeColor;
        state.fillColor = tempColor;
        fillColorPicker.value = state.fillColor;
    });

    colorClip.addEventListener('click', () => {
        state.clipColors = !state.clipColors;

        if(state.clipColors) {
            colorClip.classList.add('clipped');
            fillColorPicker.classList.add('disabled');
        }else {
            colorClip.classList.remove('clipped');
            fillColorPicker.classList.remove('disabled');
        }
    });

    fillToggle.addEventListener('click', () => {
        if(state.fill === false) {
            state.fill = true;
            fillToggle.classList.add('fill-on');
        }
        else { 
            state.fill = false;
            fillToggle.classList.remove('fill-on');
        }

    });

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
function updateStrokeColor(e) {
    state.strokeColor = e.target.value;
}

function updateFillColor(e) {
    state.fillColor = e.target.value;
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
