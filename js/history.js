import { state } from './state.js';

export function undo() {
    if(state.undoStack.length === 0) return;
    const action = state.undoStack.pop();
    action.undo();
    state.redoStack.push(action);
}

export function redo() {
    if(state.redoStack.length === 0) return;
    const action = state.redoStack.pop();
    action.redo();
    state.undoStack.push(action);
}