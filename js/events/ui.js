import { renderDynamic, renderStatic } from '../renderer.js';
import { dynamicCanvas} from '../canvas.js';
import { undo, redo } from '../history.js';
import { saveDrawing, loadDrawing } from '../fileManager.js';
import { state } from '../state.js';
import { camera } from '../camera.js';

// variables
const toolbarRect = document.querySelector('#toolbar').getBoundingClientRect();
const currentToolButton = document.querySelector('#current-tool');
const tools = document.querySelectorAll('.tool');
const toolbarToggle = document.querySelector('#toolbar-toggle');

const fillToggle = document.querySelector('#fill-toggle');
const strokeColorPicker = document.querySelector('#stroke-color-picker');
const fillColorPicker = document.querySelector('#fill-color-picker');
const colorSwap = document.querySelector('#color-swap');
const colorClip = document.querySelector('#color-clip');

const strokeWidthInput = document.querySelector('#stroke-width-display');
const strokeWidthSlider = document.querySelector('#stroke-width-slider');
const undoButton = document.querySelector('#undo');
const redoButton = document.querySelector('#redo');

const saveButton = document.querySelector('#save');
const loadButton = document.querySelector('#load');

const zoomInButton = document.querySelector('#zoom-in');
const zoomOutButton = document.querySelector('#zoom-out');
const zoomSlider = document.querySelector('#zoom-slider');
const zoomDisplay = document.querySelector('#zoom-display');

export function initUI() {
    
    // event listners

    toolbarToggle.addEventListener('click', () => {
        const toolbar = document.querySelector('#toolbar');
        toolbar.classList.toggle('collapsed');
        if(toolbar.classList.contains('collapsed')) {
            toolbarToggle.textContent = ')';
        } else {
            toolbarToggle.textContent = '(';
        }
    });

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

    zoomInButton.addEventListener('click', () => {
        camera.zoom = Math.min(camera.zoom * 1.1, 50);
        updateZoomDisplay();
        renderDynamic();
        renderStatic();
    });

    zoomOutButton.addEventListener('click', () => {
        camera.zoom = Math.max(camera.zoom / 1.1, 0.01);
        updateZoomDisplay();
        renderDynamic();
        renderStatic();
    });

    zoomSlider.addEventListener('input', (e) => {
        const zoomPercent = parseInt(e.target.value);
        const minZoom = 0.01;
        const maxZoom = 50;
        const minP = 1;
        const maxP = 150;

        // reverse the normalization
        const t = (zoomPercent - minP) / (maxP - minP);
        camera.zoom = Math.exp(t * (Math.log(maxZoom) - Math.log(minZoom)) + Math.log(minZoom));
        updateZoomDisplay();
        renderDynamic();
        renderStatic();
    });


    saveButton.addEventListener('click', saveDrawing);
    loadButton.addEventListener('click', loadDrawing);
    console.log(camera.zoom);
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

function getZoomPercent(zoom) {
    const minZoom = 0.01;
    const maxZoom = 50;

    const minP = 1;
    const maxP = 150;

    // normalize zoom into 0–1 log space
    const logMin = Math.log(minZoom);
    const logMax = Math.log(maxZoom);
    const logZoom = Math.log(zoom);

    const t = (logZoom - logMin) / (logMax - logMin);

    return Math.round(minP + t * (maxP - minP));
}
export function updateZoomDisplay() {
    const zoomPercent = Math.round(getZoomPercent(camera.zoom));

    zoomDisplay.textContent = `${zoomPercent}%`;
    zoomSlider.value = zoomPercent;
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
    setActiveToolIcon();

    if(state.tool !== 'eraser') currentToolButton.classList.add('active');
    else currentToolButton.classList.remove('active');
}

export function setActiveToolIcon() {
    switch(state.tool) {
        case 'pen': currentToolButton.textContent = '🖊'; break;
        case 'line': currentToolButton.textContent = '/'; break;
        case 'rect': currentToolButton.textContent = '⬜'; break;
        case 'ellipse': currentToolButton.textContent = '⚪'; break;
    }
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
