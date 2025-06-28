import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useDrawing } from "@/hooks/useDrawing";
import { useToast } from "@/hooks/useToast";

interface Step {
  description: string;
  expression: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
  problem_type?: string;
  steps?: Step[];
  method?: string;
}

interface CalculationResult {
  expr: string;
  result: string;
  problem_type?: string;
  steps?: Step[];
  method?: string;
  timestamp: number;
}

export default function Calculate() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(59, 130, 246)"); // Blue default
  const [dictOfVars, setDictOfVars] = useState({});
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [stepModeEnabled, setStepModeEnabled] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CalculationResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Use the drawing hook
  const drawing = useDrawing(canvasRef);
  const { addToast } = useToast();

  // Colors palette
  const colors = [
    { name: "Blue", value: "rgb(59, 130, 246)", class: "bg-blue-500" },
    { name: "Purple", value: "rgb(147, 51, 234)", class: "bg-purple-500" },
    { name: "Green", value: "rgb(34, 197, 94)", class: "bg-green-500" },
    { name: "Red", value: "rgb(239, 68, 68)", class: "bg-red-500" },
    { name: "Orange", value: "rgb(249, 115, 22)", class: "bg-orange-500" },
    { name: "Pink", value: "rgb(236, 72, 153)", class: "bg-pink-500" },
    { name: "White", value: "rgb(255, 255, 255)", class: "bg-white" },
  ];

  // Brush sizes
  const brushSizes = [1, 2, 4, 6, 8, 12, 16];

  // Problem type styling
  const getProblemTypeStyle = (problemType?: string) => {
    switch (problemType) {
      case 'calculus':
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-400/30',
          text: 'text-purple-300',
          icon: '∫',
          label: 'Calculus'
        };
      case 'algebra':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-400/30',
          text: 'text-emerald-300',
          icon: '𝑥',
          label: 'Algebra'
        };
      case 'geometry':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/30',
          text: 'text-blue-300',
          icon: '△',
          label: 'Geometry'
        };
      case 'arithmetic':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-400/30',
          text: 'text-orange-300',
          icon: '+',
          label: 'Arithmetic'
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-400/30',
          text: 'text-gray-300',
          icon: '≡',
          label: 'General'
        };
    }
  };

  // Setup canvas
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      drawing.setupCanvas();
    }, 50);
    
    const handleResize = () => {
      setTimeout(() => {
        drawing.setupCanvas();
      }, 50);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [drawing]);

  // Note: Removed canvas recalculation on sidebar changes to prevent coordinate issues

  // Drawing handlers
  const startDrawing = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    setIsDrawing(true);
    drawing.startDrawing(e);
  }, [drawing]);

  const draw = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    drawing.draw(e, color);
  }, [isDrawing, drawing, color]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Calculate handler
  const handleCalculate = useCallback(async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (!canvas) {
      addToast("Canvas not found", "error");
      setLoading(false);
      return;
    }

    try {
      addToast("Analyzing your expression...", "info", 2000);
      
      // Optimize image size for transmission
      let imageData;
      
      // If canvas is very large, create a smaller version
      if (canvas.width > 1200 || canvas.height > 800) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Calculate optimal size (max 1200x800 while maintaining aspect ratio)
          const aspectRatio = canvas.width / canvas.height;
          if (aspectRatio > 1.5) {
            tempCanvas.width = 1200;
            tempCanvas.height = 1200 / aspectRatio;
          } else {
            tempCanvas.height = 800;
            tempCanvas.width = 800 * aspectRatio;
          }
          
          // Draw scaled down version
          tempCtx.fillStyle = 'black';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
          
          imageData = tempCanvas.toDataURL("image/jpeg", 0.8);
        } else {
          imageData = canvas.toDataURL("image/jpeg", 0.8);
        }
      } else {
        imageData = canvas.toDataURL("image/jpeg", 0.8);
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/calculate`,
        {
          image: imageData,
          dict_of_vars: dictOfVars,
        },
        { withCredentials: true }
      );

      const resp = await response.data;

      if (!resp.data || resp.data.length === 0) {
        addToast("Could not recognize the equation. Please try drawing more clearly.", "warning");
        return;
      }

      // Update variables dictionary
      resp.data.forEach((data: Response) => {
        if (data.assign === true) {
          setDictOfVars(prev => ({
            ...prev,
            [data.expr]: data.result,
          }));
        }
      });

      // Add new results
      const newResults = resp.data.map((data: Response) => ({
        expr: data.expr,
        result: data.result,
        problem_type: data.problem_type,
        steps: data.steps,
        method: data.method,
        timestamp: Date.now(),
      }));

      setResults(prev => [...newResults, ...prev]);
      setShowResults(true);
      
      // Auto-select first result with steps if in step mode
      if (stepModeEnabled && newResults[0]?.steps?.length > 0) {
        setSelectedResult(newResults[0]);
        setCurrentStep(0);
        // Don't show popup, steps will be shown in sidebar
      }
      
      addToast("Calculation completed!", "success");

    } catch (error) {
      console.error("Error during calculation:", error);
      addToast("Failed to calculate. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [dictOfVars, addToast, stepModeEnabled]);

  // Clear canvas
  const handleClear = useCallback(() => {
    drawing.reset();
    addToast("Canvas cleared", "info", 1000);
  }, [drawing, addToast]);

  // Clear all results
  const handleClearResults = useCallback(() => {
    setResults([]);
    setDictOfVars({});
    setSelectedResult(null);
    addToast("All results cleared", "info", 1000);
  }, [addToast]);

  // Copy result
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast("Copied to clipboard!", "success", 1500);
    }).catch(() => {
      addToast("Failed to copy to clipboard", "error");
    });
  }, [addToast]);

  // Step navigation
  const nextStep = useCallback(() => {
    if (selectedResult?.steps && currentStep < selectedResult.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [selectedResult?.steps, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              drawing.redo();
            } else {
              drawing.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            drawing.redo();
            break;
          case 'r':
            e.preventDefault();
            handleClear();
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'enter':
            e.preventDefault();
            if (!loading) {
              handleCalculate();
            }
            break;
          case 'escape':
            e.preventDefault();
            if (selectedResult) {
              setSelectedResult(null);
            } else if (showResults) {
              setShowResults(false);
            }
            break;
          case 'arrowleft':
            if (selectedResult) {
              e.preventDefault();
              prevStep();
            }
            break;
          case 'arrowright':
            if (selectedResult) {
              e.preventDefault();
              nextStep();
            }
            break;
          case 's':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              setStepModeEnabled(prev => !prev);
            }
            break;
          case 'h':
            e.preventDefault();
            // Show help in console instead of toast
            console.log("Keyboard Shortcuts: Enter (Calculate), Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+R (Clear), Esc (Close), ← → (Navigate steps)");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawing, handleCalculate, handleClear, loading, selectedResult, showResults, stepModeEnabled, addToast, prevStep, nextStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm sm:text-lg">NeuroMath</span>
                <span className="text-gray-400 text-xs hidden sm:block">AI Calculator</span>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Button>

              <Button
                onClick={() => setStepModeEnabled(!stepModeEnabled)}
                variant={stepModeEnabled ? "default" : "outline"}
                size="sm"
                className={`${stepModeEnabled ? 
                  "bg-gradient-to-r from-green-600 to-blue-600" : 
                  "border-white/20 text-white hover:bg-white/10"
                } text-xs sm:text-sm px-2 sm:px-3`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden sm:inline">{stepModeEnabled ? 'Steps ON' : 'Steps OFF'}</span>
              </Button>

              <Button
                onClick={() => setShowResults(!showResults)}
                variant={showResults ? "default" : "outline"}
                size="sm"
                className={`${showResults ? 
                  "bg-gradient-to-r from-green-600 to-blue-600" : 
                  "border-white/20 text-white hover:bg-white/10"
                } text-xs sm:text-sm px-2 sm:px-3 relative`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" className={`transition-transform duration-200 ${showResults ? "rotate-180" : ""}`} />
                </svg>
                <span className="hidden sm:inline">{showResults ? 'Hide Results' : 'Show Results'}</span>
                {results.length > 0 && !showResults && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {results.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen relative overflow-hidden pt-16 sm:pt-20">
        {/* Main Drawing Area */}
        <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${showResults ? 'sm:mr-80 md:mr-96' : ''}`}>
          {/* Drawing Tools */}
          <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-2 sm:p-4 relative z-20">
            <div className="flex items-center justify-between w-full">
              {/* Left Tools */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {/* Color Palette */}
                <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg p-1 sm:p-2">
                  <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">Color:</span>
                  <div className="flex gap-0.5 sm:gap-1">
                    {colors.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setColor(colorOption.value)}
                        className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                          color === colorOption.value ? 'border-white scale-110' : 'border-white/30 hover:border-white/60'
                        } ${colorOption.class}`}
                        title={colorOption.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-1 sm:gap-2 bg-white/5 rounded-lg p-1 sm:p-2">
                  <span className="text-white text-xs sm:text-sm font-medium hidden sm:inline">Size:</span>
                  <div className="flex gap-0.5 sm:gap-1">
                    {brushSizes.slice(0, 5).map((size) => (
                      <button
                        key={size}
                        onClick={() => drawing.setBrushSize(size)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border transition-all flex items-center justify-center ${
                          drawing.brushSize === size ? 
                          'border-blue-400 bg-blue-500/20' : 
                          'border-white/30 hover:border-white/60 hover:bg-white/10'
                        }`}
                      >
                        <div 
                          className="bg-white rounded-full"
                          style={{ 
                            width: `${Math.min(size * 1.5, 10)}px`, 
                            height: `${Math.min(size * 1.5, 10)}px` 
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eraser */}
                <Button
                  onClick={() => drawing.setIsEraser(!drawing.isEraser)}
                  variant={drawing.isEraser ? "default" : "outline"}
                  size="sm"
                  className={`${drawing.isEraser ? 
                    "bg-red-600 hover:bg-red-700" : 
                    "border-white/20 text-white hover:bg-white/10"
                  } text-xs sm:text-sm px-2 sm:px-3`}
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Eraser</span>
                </Button>
              </div>

              {/* Right Tools */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Button
                  onClick={drawing.undo}
                  disabled={!drawing.canUndo}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>

                <Button
                  onClick={drawing.redo}
                  disabled={!drawing.canRedo}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                  </svg>
                </Button>

                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="border-red-400/30 text-red-300 hover:bg-red-500/20 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Clear</span>
                </Button>

                <Button
                  onClick={handleCalculate}
                  disabled={loading}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Solving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Calculate
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-slate-800/50 to-gray-900/50">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{ 
                touchAction: 'none',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            

            
            {/* Canvas Overlay Instructions */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
              <div className="text-center text-white/30 select-none max-w-sm">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">Draw your mathematical expression</p>
                <p className="text-xs sm:text-sm">Use your finger or mouse to write equations on this canvas</p>
                <p className="text-xs mt-2 sm:mt-4 opacity-60 hidden sm:block">Press 'H' for keyboard shortcuts</p>
              </div>
            </div>

            {/* Quick Help Button */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30">
              <Button
                onClick={() => console.log("Keyboard Shortcuts: Enter (Calculate), Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+R (Clear), Esc (Close), ← → (Navigate steps)")}
                variant="outline"
                size="sm"
                className="bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-xs sm:text-sm p-2 sm:px-3 sm:py-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Help</span>
              </Button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 text-white/40 text-xs bg-black/20 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border border-white/10">
              <div className="text-center">
                <p className="font-medium mb-0.5 sm:mb-1 text-xs sm:text-sm">NeuroMath Calculator</p>
                <p className="text-[8px] sm:text-[10px] opacity-75">© 2024 HaRsH - AI-Powered Math Solver</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className={`fixed top-16 sm:top-20 right-0 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-11/12 sm:w-80 md:w-96 bg-black/90 backdrop-blur-xl border-l border-white/20 flex flex-col transform transition-transform duration-300 ease-in-out z-40 shadow-2xl ${showResults ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Results Header */}
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Results</h2>
                <div className="flex gap-1 sm:gap-2">
                  {results.length > 0 && (
                    <Button
                      onClick={handleClearResults}
                      variant="outline"
                      size="sm"
                      className="border-red-400/30 text-red-300 hover:bg-red-500/20 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowResults(false)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:px-3 sm:py-2"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                {results.length === 0 ? 'No calculations yet' : `${results.length} calculation${results.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[calc(100vh-200px)]">
              {results.length === 0 ? (
                <div className="text-center text-gray-400 py-8 sm:py-12 px-4">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm sm:text-base">Draw an expression and click Calculate to see results here</p>
                </div>
              ) : (
                results.map((result, index) => {
                  const problemStyle = getProblemTypeStyle(result.problem_type);
                  const hasSteps = result.steps && result.steps.length > 0;
                  
                  return (
                    <div 
                      key={`${result.timestamp}-${index}`}
                      className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 sm:p-4 hover:border-white/20 transition-all duration-200"
                    >
                      {/* Result Header */}
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <div className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-xs ${problemStyle.bg} ${problemStyle.border} border`}>
                            <span className={problemStyle.text}>{problemStyle.icon} {problemStyle.label}</span>
                          </div>
                          {hasSteps && (
                            <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-500/20 border border-blue-400/30 rounded-md text-xs text-blue-300">
                              {result.steps?.length} steps
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleCopy(`${result.expr} = ${result.result}`)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10 h-6 w-6 p-0 flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      </div>

                      {/* Expression */}
                      <div className="mb-2 sm:mb-3">
                        <div className="text-xs text-gray-400 mb-1">Expression:</div>
                        <div className="bg-black/30 rounded-lg p-2 font-mono text-blue-200 text-xs sm:text-sm break-all">
                          {result.expr}
                        </div>
                      </div>

                      {/* Result */}
                      <div className="mb-2 sm:mb-3">
                        <div className="text-xs text-gray-400 mb-1">Answer:</div>
                        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg p-2 sm:p-3 border border-emerald-400/20">
                          <span className="text-emerald-300 font-mono text-base sm:text-lg font-bold break-all">
                            {result.result}
                          </span>
                        </div>
                      </div>

                      {/* Method */}
                      {result.method && (
                        <div className="mb-2 sm:mb-3">
                          <div className="text-xs text-gray-400 mb-1">Method:</div>
                          <div className="text-yellow-300 text-xs sm:text-sm font-medium">
                            {result.method}
                          </div>
                        </div>
                      )}

                      {/* Steps Section */}
                      {hasSteps && (
                        <div className="mt-2 sm:mt-3">
                          <Button
                            onClick={() => {
                              if (selectedResult === result) {
                                setSelectedResult(null);
                              } else {
                                setSelectedResult(result);
                                setCurrentStep(0);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-400/30 text-purple-300 hover:bg-purple-500/20 mb-2 sm:mb-3 text-xs sm:text-sm"
                          >
                            <svg className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 transition-transform ${selectedResult === result ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {selectedResult === result ? 'Hide Steps' : 'Show Step-by-Step Solution'}
                          </Button>

                          {/* Inline Steps Display */}
                          {selectedResult === result && result.steps && (
                            <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 sm:p-4">
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <h5 className="text-xs sm:text-sm font-semibold text-purple-200">Solution Steps</h5>
                                <div className="text-xs text-purple-300">
                                  Step {currentStep + 1} of {result.steps.length}
                                </div>
                              </div>

                              {/* Current Step */}
                              <div className="mb-3 sm:mb-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {currentStep + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-purple-100 text-xs sm:text-sm mb-1 sm:mb-2 leading-relaxed">
                                      {result.steps[currentStep].description}
                                    </div>
                                    <div className="bg-black/40 rounded p-2 border border-purple-400/20">
                                      <span className="text-purple-200 font-mono text-xs sm:text-sm break-all">
                                        {result.steps[currentStep].expression}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Step Navigation */}
                              <div className="flex items-center justify-between">
                                <Button
                                  onClick={prevStep}
                                  disabled={currentStep === 0}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 text-xs px-2 py-1"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                  Prev
                                </Button>

                                <div className="flex gap-1">
                                  {result.steps.map((_, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setCurrentStep(index)}
                                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        index === currentStep ? 'bg-purple-400' : 'bg-white/20 hover:bg-white/40'
                                      }`}
                                    />
                                  ))}
                                </div>

                                <Button
                                  onClick={nextStep}
                                  disabled={currentStep === result.steps.length - 1}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-400/30 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 text-xs px-2 py-1"
                                >
                                  Next
                                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
      </div>

      {/* Step-by-Step Modal Removed - Now using inline steps in sidebar */}
    </div>
  );
} 