export const state = {
  tool: 'pen',       // active tool
  isErasing: false,
  color: '#1a1614',  // active stroke color
  strokeWidth: 3,    // active stroke width

  history: [],
  redoStack: [],     
  currentStroke: null, // the stroke being drawn right now
  currentShape: null
};