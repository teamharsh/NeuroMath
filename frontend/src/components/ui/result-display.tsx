import React from 'react';
import Draggable from 'react-draggable';
import { injectResultDisplayStyles } from './result-display-styles';

interface ResultDisplayProps {
  results: Array<{
    expr: string;
    result: string;
  }>;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onCopy?: (text: string) => void;
  onClose?: (index: number) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  results,
  position,
  onPositionChange,
  onCopy,
  onClose,
}) => {
  // Inject styles
  React.useEffect(() => {
    injectResultDisplayStyles();
  }, []);

  // Create refs for all draggable elements using useMemo for better performance
  const nodeRefs = React.useMemo(
    () => results.map(() => React.createRef<HTMLDivElement>()),
    [results]
  );

  if (!results || results.length === 0) return null;

  return (
    <>
      {results.map((result, index) => {
        // Get the ref for this specific element
        const nodeRef = nodeRefs[index];
        
        // Skip rendering if ref is not available
        if (!nodeRef) return null;
        
        // Calculate offset position for each result
        const defaultPos = { 
          x: position.x + (index * 25), 
          y: position.y + (index * 25) 
        };
        
        return (
          <Draggable
            key={`result-${index}-${result.expr}`}
            nodeRef={nodeRef}
            defaultPosition={defaultPos}
            onStop={(_, data) => {
              // Update position for the first item only (for backward compatibility)
              if (index === 0) {
                onPositionChange({ x: data.x, y: data.y });
              }
            }}
            handle=".drag-handle"
            enableUserSelectHack={false}
            bounds="parent"
          >
          <div ref={nodeRef} className="absolute z-40 animate-slideInScale">
            <div className="result-card group relative bg-gradient-to-br from-indigo-600/90 via-purple-600/85 to-pink-600/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl min-w-[320px] max-w-[450px] overflow-hidden">
              
              {/* Glow effect - moved inside and with pointer-events-none */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"></div>
              
              {/* Content container */}
              <div className="relative bg-gradient-to-br from-indigo-600/90 via-purple-600/85 to-pink-600/80 rounded-2xl">
                {/* Animated background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                
                {/* Header - Drag Handle */}
                <div className="drag-handle relative flex items-center justify-between p-4 cursor-move select-none">
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="relative">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-glow shadow-lg shadow-emerald-400/50"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        Math Solution
                      </span>
                      <span className="text-xs text-white/70">
                        Result #{index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onCopy && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(`${result.expr} = ${result.result}`);
                        }}
                        className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group/btn pointer-events-auto"
                        title="Copy result"
                      >
                        <svg className="w-4 h-4 text-white/80 group-hover/btn:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    )}
                    {onClose && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose(index);
                        }}
                        className="p-2 hover:bg-red-500/30 rounded-xl transition-all duration-200 hover:scale-110 group/btn pointer-events-auto"
                        title="Close result"
                      >
                        <svg className="w-4 h-4 text-white/80 group-hover/btn:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="relative px-4 pb-4 space-y-4 pointer-events-none select-none">
                  {result.expr && result.expr !== 'null' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                        <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                          Expression
                        </label>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 font-mono text-white border border-white/20 shadow-inner">
                        <span className="text-blue-200 text-lg leading-relaxed">{result.expr}</span>
                      </div>
                    </div>
                  )}

                  {result.result && result.result !== 'null' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
                        <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                          Answer
                        </label>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur-sm"></div>
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/30 shadow-lg">
                          <span className="text-2xl font-bold text-emerald-300 font-mono leading-relaxed block">
                            {result.result}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Footer */}
                <div className="relative px-4 py-3 bg-black/20 backdrop-blur-sm border-t border-white/20 rounded-b-2xl pointer-events-none select-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                      <span>Drag header to reposition</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse-slow"></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse-slow" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse-slow" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
        );
      })}
    </>
  );
};

 