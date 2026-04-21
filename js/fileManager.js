import { state } from './state.js';
import { renderStatic } from './renderer.js';

export async function saveDrawing() {
    const data = {
        version: 1,
        app: 'whiteboard',
        strokes: state.strokes
    }
    const blob = new Blob(
        [JSON.stringify(data)],
        { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.wboard';
    a.click();

    URL.revokeObjectURL(url);
}

export async function loadDrawing() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wboard,application/json';
    
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (
                data.app !== 'whiteboard' ||
                !Array.isArray(data.strokes)
            ) {
                alert("Invalid file");
                return;
            }

            state.strokes = [...data.strokes];
 
            // After loading, re-render the canvas
            state.undoStack = [];
            state.redoStack = [];
            renderStatic();
            
        } catch (err) {
            alert("Failed to load file");
            console.error(err);
        }
    };
    
    input.click();

}