import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Toolbar } from "@/components/ui/toolbar";
import { SolutionSidebar } from "@/components/ui/solution-sidebar";
import { HelpModal } from "@/components/ui/help-modal";
import { useDrawing } from "@/hooks/useDrawing";
import { useToast } from "@/hooks/useToast";

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [dictOfVars, setDictOfVars] = useState({});
  const [latexExpression, setLatexExpression] = useState<
    { expr: string; result: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Hidden by default, shows when solutions are available
  
  // Use the new drawing hook
  const drawing = useDrawing(canvasRef);
  const { addToast } = useToast();

  // Setup canvas on component mount and window resize
  useEffect(() => {
    drawing.setupCanvas();
    
    const handleResize = () => {
      drawing.setupCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [drawing]); // Include drawing object to satisfy ESLint

  // Load MathJax separately to avoid canvas re-setup
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Update MathJax when expressions change
  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

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

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (!canvas) {
      addToast("Canvas not found", "error");
      setLoading(false);
      return;
    }

    try {
      addToast("Processing your drawing...", "info", 2000);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/calculate`,
        {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
        {
          withCredentials: true,
        }
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

      // Display results
      const newExpressions = resp.data.map((data: Response) => ({
        expr: data.expr,
        result: data.result,
      }));

      setLatexExpression(prev => [...prev, ...newExpressions]);
      
      // Auto-show sidebar when solutions are available
      if (newExpressions.length > 0) {
        setSidebarVisible(true);
      }
      
      addToast("Calculation completed successfully!", "success");

    } catch (error) {
      console.error("Error during calculation:", error);
      addToast("Failed to calculate. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [dictOfVars, addToast]);

  const handleReset = useCallback(() => {
    drawing.reset();
    setLatexExpression([]);
    setDictOfVars({});
    setSidebarVisible(false); // Hide sidebar when canvas is reset
    addToast("Canvas cleared", "info", 1500);
  }, [drawing, addToast]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast("Copied to clipboard!", "success", 1500);
    }).catch(() => {
      addToast("Failed to copy to clipboard", "error");
    });
  }, [addToast]);

  const handleClearAllResults = useCallback(() => {
    setLatexExpression([]);
    setDictOfVars({});
    setSidebarVisible(false); // Hide sidebar when no solutions
    addToast("All solutions cleared", "info", 1500);
  }, [addToast]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const handleHelpToggle = useCallback(() => {
    setShowHelp(prev => !prev);
  }, []);

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
            handleReset();
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
          case 'e':
            e.preventDefault();
            drawing.setIsEraser(!drawing.isEraser);
            addToast(`${drawing.isEraser ? 'Brush' : 'Eraser'} mode activated`, 'info', 1000);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawing, handleReset, handleCalculate, loading, addToast]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Enhanced Toolbar */}
      <Toolbar
        onReset={handleReset}
        onUndo={drawing.undo}
        onRedo={drawing.redo}
        onCalculate={handleCalculate}
        onColorChange={setColor}
        onBrushSizeChange={drawing.setBrushSize}
        onEraserToggle={() => drawing.setIsEraser(!drawing.isEraser)}
        onHelpToggle={handleHelpToggle}
        onSidebarToggle={handleSidebarToggle}
        currentColor={color}
        currentBrushSize={drawing.brushSize}
        isEraser={drawing.isEraser}
        isLoading={loading}
        canUndo={drawing.canUndo}
        canRedo={drawing.canRedo}
        sidebarVisible={sidebarVisible}
      />

      {/* Main Content Area */}
      <div className="flex h-screen">
        {/* Canvas Container */}
        <div className={`flex-1 transition-all duration-300 ease-in-out
          ${sidebarVisible && latexExpression.length > 0 
            ? 'md:mr-96 lg:mr-80 xl:mr-96 2xl:mr-[26rem]' 
            : 'mr-0'
          }
          pt-16 sm:pt-20
        `}>
          <canvas
            ref={canvasRef}
            id="canvas"
            className="w-full h-full bg-black touch-none"
            style={{ 
              cursor: drawing.isEraser ? 'crosshair' : 'crosshair',
              touchAction: 'none'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Solution Sidebar */}
        <SolutionSidebar
          results={latexExpression}
          onCopy={handleCopy}
          onClear={handleClearAllResults}
          isVisible={sidebarVisible}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Signature */}
      <div className={`fixed bottom-4 text-white/50 text-xs bg-black/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-white/10 z-40 transition-all duration-300 ease-in-out
        ${sidebarVisible && latexExpression.length > 0 
          ? 'md:right-[25rem] lg:right-[21rem] xl:right-[25rem] 2xl:right-[27rem] right-4' 
          : 'right-4'
        }
      `}>
        NeuroMath © HaRsH
      </div>
    </div>
  );
}
