import { useCallback, useRef, useState } from 'react';

interface DrawingState {
  imageData: ImageData | null;
  timestamp: number;
}

export const useDrawing = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [undoStack, setUndoStack] = useState<DrawingState[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingState[]>([]);
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const lastSaveTime = useRef(0);
  const isInitialized = useRef(false);
  const cachedContext = useRef<CanvasRenderingContext2D | null>(null);

  // Optimized context getter with caching and willReadFrequently
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Return cached context if available and canvas hasn't changed
    if (cachedContext.current && cachedContext.current.canvas === canvas) {
      return cachedContext.current;
    }

    // Get new context with performance optimization
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      cachedContext.current = ctx;
    }
    return ctx;
  }, [canvasRef]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    // Throttle state saving to avoid too many saves during continuous drawing
    const now = Date.now();
    if (now - lastSaveTime.current < 100) return;
    lastSaveTime.current = now;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newState: DrawingState = {
      imageData: imageData,
      timestamp: now,
    };

    setUndoStack(prev => {
      const newStack = [...prev, newState];
      // Limit undo stack to 50 states to prevent memory issues
      return newStack.length > 50 ? newStack.slice(-50) : newStack;
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [canvasRef, getContext]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = getContext();
    if (!ctx) return false;

    // Save current state to redo stack
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const currentState: DrawingState = {
      imageData: currentImageData,
      timestamp: Date.now(),
    };

    setRedoStack(prev => [...prev, currentState]);

    // Restore previous state
    const previousState = undoStack[undoStack.length - 1];
    if (previousState.imageData) {
      ctx.putImageData(previousState.imageData, 0, 0);
    }

    setUndoStack(prev => prev.slice(0, -1));
    return true;
  }, [undoStack, canvasRef, getContext]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const ctx = getContext();
    if (!ctx) return false;

    // Save current state to undo stack
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const currentState: DrawingState = {
      imageData: currentImageData,
      timestamp: Date.now(),
    };

    setUndoStack(prev => [...prev, currentState]);

    // Restore next state
    const nextState = redoStack[redoStack.length - 1];
    if (nextState.imageData) {
      ctx.putImageData(nextState.imageData, 0, 0);
    }

    setRedoStack(prev => prev.slice(0, -1));
    return true;
  }, [redoStack, canvasRef, getContext]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    // Save current state before clearing
    saveState();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.background = "black";
  }, [canvasRef, saveState, getContext]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size only if it hasn't been set or window resized
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight - 80; // Account for toolbar
    
    if (canvas.width !== newWidth || canvas.height !== newHeight || !isInitialized.current) {
      // Save current drawing before resizing (only if already initialized)
      let imageData = null;
      if (isInitialized.current) {
        const ctx = getContext();
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Clear cached context since canvas will be resized
      cachedContext.current = null;
      
      // Resize canvas
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.background = "black";
      
      // Get context with performance hint
      const ctx = getContext();
      if (!ctx) return;
      
      // Set initial canvas properties
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
      
      // Restore drawing if it existed
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
      
      isInitialized.current = true;
    } else {
      // Just update context properties if canvas size hasn't changed
      const ctx = getContext();
      if (!ctx) return;
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    }
  }, [canvasRef, brushSize, isEraser, getContext]);

  const startDrawing = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    // Save state before starting to draw
    saveState();

    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e
      ? e.touches[0].clientX - rect.left
      : (e as React.MouseEvent).nativeEvent.offsetX;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : (e as React.MouseEvent).nativeEvent.offsetY;

    ctx.moveTo(x, y);
    return { x, y };
  }, [canvasRef, brushSize, isEraser, saveState, getContext]);

  const draw = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    color: string
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    // Set drawing properties
    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over";
    
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e
      ? e.touches[0].clientX - rect.left
      : (e as React.MouseEvent).nativeEvent.offsetX;
    const y = "touches" in e
      ? e.touches[0].clientY - rect.top
      : (e as React.MouseEvent).nativeEvent.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [canvasRef, brushSize, isEraser, getContext]);

  const reset = useCallback(() => {
    clearCanvas();
    setUndoStack([]);
    setRedoStack([]);
  }, [clearCanvas]);

  return {
    // Drawing functions
    setupCanvas,
    startDrawing,
    draw,
    saveState,
    
    // State management
    undo,
    redo,
    reset,
    clearCanvas,
    
    // Properties
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser,
    
    // State indicators
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}; 