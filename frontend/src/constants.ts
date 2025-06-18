const SWATCHES = [
    "#ffffff",  // white
    "#000000",  // black
    "#ee3333",  // red
    "#e64980",  // pink
    "#be4bdb",  // purple
    "#893200",  // brown
    "#228be6",  // blue
    "#3333ee",  // dark blue
    "#40c057",  // green",
    "#00aa00",  // dark green
    "#fab005",  // yellow
    "#fd7e14",  // orange
];

// Organized color categories for better UX
const COLOR_CATEGORIES = {
    grayscale: ["#ffffff", "#cccccc", "#888888", "#444444", "#000000"],
    warm: ["#ee3333", "#e64980", "#fd7e14", "#fab005"],
    cool: ["#228be6", "#3333ee", "#40c057", "#00aa00"],
    accent: ["#be4bdb", "#893200", "#ff6b6b", "#4ecdc4"]
};

// Default drawing settings
const DRAWING_DEFAULTS = {
    brushSize: 3,
    color: "#ffffff",
    backgroundColor: "#000000",
    minBrushSize: 1,
    maxBrushSize: 50,
    undoLimit: 50,
};

// Keyboard shortcuts
const SHORTCUTS = {
    undo: "Ctrl+Z",
    redo: "Ctrl+Y",
    reset: "Ctrl+R",
    calculate: "Enter",
    toggleEraser: "E",
};
  
export { SWATCHES, COLOR_CATEGORIES, DRAWING_DEFAULTS, SHORTCUTS };