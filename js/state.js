export const state = {
  tool: 'pen',       // active tool
  strokeColor: '#1a1614',  // active stroke color
  strokeWidth: 5,    // active stroke width
  fill: false,
  fillColor: '#1a1614',  // active fill color
  clipColors: false,
  
  // GLOBAL FLAGS
  isErasing: false,
  isSpaceDown: false,

  strokes: [],
  undoStack: [],
  redoStack: [],
  
  currentStroke: null, // the stroke being drawn right now
  currentShape: null,

  mouseX: 0,   //Mouse position
  mouseY: 0
};
