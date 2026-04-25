import { state } from './state.js';
import { emitStroke, emitErase } from './multiplayer/socket.js';

export function undo() {
    if(state.undoStack.length === 0) return;
    const action = state.undoStack.pop();
    action.undo();
    state.redoStack.push(action);
    emitUndoRedo(action, 'undo');
}

export function redo() {
    if(state.redoStack.length === 0) return;
    const action = state.redoStack.pop();
    action.redo();
    state.undoStack.push(action);
    emitUndoRedo(action, 'redo');
}

function emitUndoRedo(action, direction) {
  if (!state.roomCode) return;

  if (action.type === 'add') {
    if (direction === 'undo') {
      // stroke was removed — tell peers to erase it
      emitErase([action.strokeId]);
    } else {
      // stroke came back — tell peers to add it
      emitStroke(action.stroke);
    }
  }

  if (action.type === 'erase') {
    if (direction === 'undo') {
      // strokes came back — tell peers to add them all
      action.removed.forEach(s => emitStroke(s));
    } else {
      // strokes removed again — tell peers to erase them
      emitErase(action.removedIds);
    }
  }
}