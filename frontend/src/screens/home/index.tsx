import { ColorSwatch, Loader } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { SWATCHES } from "@/constants";
// import {LazyBrush} from 'lazy-brush';

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255, 255, 255)");
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [latexExpression, setLatexExpression] = useState<
    { expr: string; result: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 80;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
  }, []);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    // const canvas = canvasRef.current;

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

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
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [resizeCanvas]);

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = {
      expr: expression,
      result: answer,
    };
    setLatexExpression([...latexExpression, latex]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();

        const x =
          "touches" in e
            ? e.touches[0].clientX - canvas.getBoundingClientRect().left
            : (e as React.MouseEvent).nativeEvent.offsetX;
        const y =
          "touches" in e
            ? e.touches[0].clientY - canvas.getBoundingClientRect().top
            : (e as React.MouseEvent).nativeEvent.offsetY;

        ctx.moveTo(x, y);
        setIsDrawing(true);
      }
    }
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) {
      return;
    }

    if ("touches" in e) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;

        const x =
          "touches" in e
            ? e.touches[0].clientX - canvas.getBoundingClientRect().left
            : (e as React.MouseEvent).nativeEvent.offsetX;
        const y =
          "touches" in e
            ? e.touches[0].clientY - canvas.getBoundingClientRect().top
            : (e as React.MouseEvent).nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const runRoute = async () => {
    setLoading(true);
    const canvas = canvasRef.current;

    if (canvas) {
      try {
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

        if (resp.data.length === 0) {
          alert("Improve drawing and retry.");
          return;
        }

        resp.data.forEach((data: Response) => {
          if (data.assign === true) {
            setDictOfVars({
              ...dictOfVars,
              [data.expr]: data.result,
            });
          }
        });
        const ctx = canvas.getContext("2d");
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        let minX = canvas.width,
          minY = canvas.height,
          maxX = 0,
          maxY = 0;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const i = (y * canvas.width + x) * 4;
            if (imageData.data[i + 3] > 0) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setLatexPosition({ x: centerX, y: centerY });
        resp.data.forEach((data: Response) => {
          setTimeout(() => {
            setResult({
              expression: data.expr,
              answer: data.result,
            });
          }, 1000);
        });
      } catch (error) {
        console.error("Error during calculation:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg z-30 py-3">
        <div className="container mx-auto px-2 flex flex-wrap items-center justify-between gap-2">
          <Button
            onClick={() => setReset(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            variant="default"
            size="sm"
          >
            ♻️ Reset
          </Button>

          <div className="flex flex-col items-center">
            <Button
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 mb-1"
              variant="outline"
              size="sm"
            >
              🎨 Colors {showColorPalette ? "▲" : "▼"}
            </Button>

            {showColorPalette && (
              <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-gray-800 rounded-md max-w-[200px]">
                {SWATCHES.map((swatch) => (
                  <ColorSwatch
                    key={swatch}
                    color={swatch}
                    onClick={() => setColor(swatch)}
                    style={{
                      backgroundColor: swatch,
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border:
                        color === swatch ? "2px solid white" : "1px solid gray",
                      cursor: "pointer",
                    }}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={runRoute}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            variant="default"
            disabled={loading}
            size="sm"
          >
            {loading ? <Loader size="xs" color="white" /> : "Run"}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full bg-black touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(_, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-3 rounded-lg shadow-md bg-gray-800 text-white hover:bg-gray-700 transition duration-200 cursor-move">
              {latex.expr !== undefined && latex.expr !== null && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-300">
                    Expression:
                  </span>
                  <div className="text-base font-serif">{latex.expr}</div>
                </div>
              )}

              {latex.result !== undefined && latex.result !== null && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-300">
                    Result:
                  </span>
                  <div className="text-base font-serif">{latex.result}</div>
                </div>
              )}
            </div>
          </Draggable>
        ))}
    </>
  );
}
