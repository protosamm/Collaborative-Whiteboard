import { state } from './state.js';

export function undo() {
    if(state.history.length === 0) return;
    const lastStroke = state.history.pop();
    state.redoStack.push(lastStroke);
}

export function redo() {
    if(state.redoStack.length === 0) return;
    const nextStroke = state.redoStack.pop();
    state.history.push(nextStroke);
}