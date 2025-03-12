import { ColorSwatch, Loader } from "@mantine/core";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
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
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
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

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = {
      expr: expression,
      result: answer,
    };
    setLatexExpression([...latexExpression, latex]);

    // Clear the main canvas
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "black";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
      }
    }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
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
              // If pixel is not transparent
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
        // Handle error appropriately (e.g., display an error message)
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-20 bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-lg z-30 flex items-center justify-center">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => setReset(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            variant="default"
          >
            ♻️ Reset
          </Button>

          <div className="flex items-center space-x-3">
            {SWATCHES.map((swatch) => (
              <ColorSwatch
                key={swatch}
                color={swatch}
                onClick={() => setColor(swatch)}
                style={{
                  backgroundColor: swatch,
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  cursor: "pointer",
                }}
                className="focus:outline-none hover:scale-110 transition-transform"
              />
            ))}
          </div>

          <Button
            onClick={runRoute}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            variant="default"
            disabled={loading}
          >
            {loading ? <Loader size="sm" color="white" /> : "Run"}
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full bg-black"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
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
