import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

interface Step {
  description: string;
  expression: string;
}

interface StepByStepDisplayProps {
  expr: string;
  result: string;
  problem_type?: string;
  steps?: Step[];
  method?: string;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onCopy?: (text: string) => void;
  onClose?: () => void;
}

// Helper function to get problem type styling
const getProblemTypeStyle = (problemType?: string) => {
  switch (problemType) {
    case 'calculus':
      return {
        gradient: 'from-purple-600/90 via-indigo-600/85 to-blue-600/80',
        accentColor: 'purple',
        icon: '∫',
        label: 'Calculus'
      };
    case 'algebra':
      return {
        gradient: 'from-emerald-600/90 via-teal-600/85 to-green-600/80',
        accentColor: 'emerald',
        icon: '𝑥',
        label: 'Algebra'
      };
    case 'geometry':
      return {
        gradient: 'from-blue-600/90 via-cyan-600/85 to-sky-600/80',
        accentColor: 'blue',
        icon: '△',
        label: 'Geometry'
      };
    case 'arithmetic':
      return {
        gradient: 'from-orange-600/90 via-red-600/85 to-pink-600/80',
        accentColor: 'orange',
        icon: '+',
        label: 'Arithmetic'
      };
    default:
      return {
        gradient: 'from-gray-600/90 via-slate-600/85 to-zinc-600/80',
        accentColor: 'gray',
        icon: '≡',
        label: 'General'
      };
  }
};

export const StepByStepDisplay: React.FC<StepByStepDisplayProps> = ({
  expr,
  result,
  problem_type,
  steps,
  method,
  position,
  onPositionChange,
  onCopy,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const nodeRef = React.createRef<HTMLDivElement>();
  
  const problemStyle = getProblemTypeStyle(problem_type);
  const hasSteps = steps && steps.length > 0;

  // Auto-advance through steps
  useEffect(() => {
    if (!hasSteps || showAllSteps) return;
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length) {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setIsAnimating(false);
        }, 300);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep, hasSteps, steps?.length, showAllSteps]);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex + 1);
  };

  const toggleShowAllSteps = () => {
    setShowAllSteps(!showAllSteps);
    if (!showAllSteps) {
      setCurrentStep(steps?.length || 0);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={position}
      onStop={(_, data) => onPositionChange({ x: data.x, y: data.y })}
      handle=".drag-handle"
      bounds="parent"
    >
      <div ref={nodeRef} className="absolute z-50 animate-slideInScale">
        <div className={`group relative bg-gradient-to-br ${problemStyle.gradient} backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl min-w-[400px] max-w-[600px] overflow-hidden`}>
          
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-3xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none"></div>
          
          {/* Content container */}
          <div className={`relative bg-gradient-to-br ${problemStyle.gradient} rounded-3xl`}>
            
            {/* Header */}
            <div className="drag-handle relative flex items-center justify-between p-5 cursor-move">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-pulse-glow">
                    {problemStyle.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{problemStyle.label} Solution</h3>
                  <p className="text-sm text-white/70">Step-by-step breakdown</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {hasSteps && (
                  <button
                    onClick={toggleShowAllSteps}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 text-white/80 hover:text-white"
                    title={showAllSteps ? 'Auto-advance' : 'Show all steps'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAllSteps ? "M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 4v16m8-8H4"} />
                    </svg>
                  </button>
                )}
                {onCopy && (
                  <button
                    onClick={() => {
                      const stepsText = steps?.map((step, i) => `Step ${i + 1}: ${step.description}\n${step.expression}`).join('\n\n') || '';
                      onCopy(`${expr}\n\nMethod: ${method}\n\nSteps:\n${stepsText}\n\nAnswer: ${result}`);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 text-white/80 hover:text-white"
                    title="Copy solution"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-red-500/30 rounded-xl transition-all duration-200 hover:scale-110 text-white/80 hover:text-red-300"
                    title="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-5 space-y-5">
              
              {/* Original Expression */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-400 rounded-full"></div>
                  <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                    Problem
                  </label>
                </div>
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <span className="text-blue-200 text-lg font-mono leading-relaxed">{expr}</span>
                </div>
              </div>

              {/* Method */}
              {method && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-yellow-400 rounded-full"></div>
                    <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      Method
                    </label>
                  </div>
                  <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
                    <span className="text-yellow-200 font-semibold">{method}</span>
                  </div>
                </div>
              )}

              {/* Steps */}
              {hasSteps && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
                      <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                        Solution Steps
                      </label>
                    </div>
                    <div className="text-xs text-white/60">
                      {showAllSteps ? `${steps.length} steps` : `${Math.min(currentStep, steps.length)}/${steps.length}`}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {steps.slice(0, showAllSteps ? steps.length : currentStep).map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`transform transition-all duration-500 ${
                          stepIndex === currentStep - 1 && isAnimating ? 'scale-105 opacity-50' : 'scale-100 opacity-100'
                        }`}
                        onClick={() => !showAllSteps && handleStepClick(stepIndex)}
                      >
                        <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer group/step">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
                              {stepIndex + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="text-purple-100 font-medium leading-relaxed">
                                {step.description}
                              </div>
                              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-400/20 group-hover/step:border-purple-400/40 transition-colors duration-300">
                                <span className="text-purple-200 font-mono text-lg leading-relaxed">
                                  {step.expression}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!showAllSteps && currentStep < steps.length && (
                    <div className="flex justify-center">
                      <div className="animate-bounce">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final Answer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-400 rounded-full"></div>
                  <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                    Final Answer
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur-sm"></div>
                  <div className="relative bg-emerald-500/20 backdrop-blur-sm rounded-xl p-5 border border-emerald-400/40 shadow-xl">
                    <span className="text-3xl font-bold text-emerald-300 font-mono leading-relaxed block text-center">
                      {result}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-black/20 backdrop-blur-sm border-t border-white/20 rounded-b-3xl">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Drag header to reposition</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}; 