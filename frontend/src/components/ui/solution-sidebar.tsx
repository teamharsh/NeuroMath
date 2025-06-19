import React, { useState, useEffect } from 'react';

interface Step {
  description: string;
  expression: string;
}

interface SolutionSidebarProps {
  results: Array<{
    expr: string;
    result: string;
    problem_type?: string;
    steps?: Step[];
    method?: string;
  }>;
  onCopy?: (text: string) => void;
  onClear?: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

// Helper function to get problem type styling
const getProblemTypeStyle = (problemType?: string) => {
  switch (problemType) {
    case 'calculus':
      return {
        color: 'from-purple-500 to-indigo-600',
        bgColor: 'bg-purple-500/20',
        textColor: 'text-purple-300',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ),
        label: 'Calculus'
      };
    case 'algebra':
      return {
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-300',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        ),
        label: 'Algebra'
      };
    case 'geometry':
      return {
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-300',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ),
        label: 'Geometry'
      };
    case 'arithmetic':
      return {
        color: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-300',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        ),
        label: 'Arithmetic'
      };
    default:
      return {
        color: 'from-gray-500 to-slate-600',
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-300',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ),
        label: 'General'
      };
  }
};

export const SolutionSidebar: React.FC<SolutionSidebarProps> = ({
  results,
  onCopy,
  onClear,
  isVisible,
  onToggle,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showSteps, setShowSteps] = useState<Set<number>>(new Set());

  // Auto-expand new results
  useEffect(() => {
    if (results.length > 0) {
      setExpandedItems(prev => new Set([...prev, results.length - 1]));
    }
  }, [results.length]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSteps = (index: number) => {
    setShowSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Don't render anything if no results
  if (results.length === 0) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 md:hidden p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        title={isVisible ? 'Hide Solutions' : 'Show Solutions'}
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-300 ${isVisible ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 2xl:w-[26rem]
        md:translate-x-0
      `}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Solutions</h2>
              <p className="text-xs text-white/70">{results.length} calculation{results.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {results.length > 0 && onClear && (
              <button
                onClick={onClear}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110 text-white/70 hover:text-red-300 active:scale-95"
                title="Clear all solutions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            <button
              onClick={onToggle}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white/70 hover:text-white active:scale-95"
              title="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3" style={{ height: 'calc(100vh - 80px)' }}>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white/60 font-medium mb-2">No calculations yet</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                Draw a mathematical expression on the canvas and click calculate to see results here.
              </p>
            </div>
          ) : (
            results.map((result, index) => {
              const isExpanded = expandedItems.has(index);
              const stepsVisible = showSteps.has(index);
              const problemStyle = getProblemTypeStyle(result.problem_type);
              const hasSteps = result.steps && result.steps.length > 0;
              
              return (
                <div
                  key={`solution-${index}-${result.expr}`}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  {/* Result Header */}
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-white/5 transition-colors duration-200 active:bg-white/10"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${problemStyle.color} rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`flex items-center gap-1 px-2 py-1 ${problemStyle.bgColor} rounded-md text-xs ${problemStyle.textColor}`}>
                            {problemStyle.icon}
                            <span>{problemStyle.label}</span>
                          </div>
                          {hasSteps && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-md text-xs text-blue-300">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2z"/>
                              </svg>
                              <span>{result.steps?.length} steps</span>
                            </div>
                          )}
                        </div>
                        <div className="text-white/90 font-medium text-sm truncate">
                          {result.expr || 'Expression'}
                        </div>
                        <div className="text-emerald-300 font-mono text-base sm:text-lg font-bold truncate">
                          {result.result}
                        </div>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-white/60 transition-transform duration-200 flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-3 sm:p-4 space-y-4 bg-black/20">
                      {result.expr && result.expr !== 'null' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                            <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                              Expression
                            </label>
                          </div>
                          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 font-mono text-blue-200 border border-white/10 text-sm break-all">
                            {result.expr}
                          </div>
                        </div>
                      )}

                      {result.method && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-yellow-400 rounded-full"></div>
                            <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                              Method
                            </label>
                          </div>
                          <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/20">
                            <span className="text-yellow-300 font-medium text-sm">
                              {result.method}
                            </span>
                          </div>
                        </div>
                      )}

                      {hasSteps && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                              <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                                Solution Steps
                              </label>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSteps(index);
                              }}
                              className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-md transition-all duration-200 text-xs"
                            >
                              <svg 
                                className={`w-3 h-3 transition-transform duration-200 ${stepsVisible ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span>{stepsVisible ? 'Hide' : 'Show'} Steps</span>
                            </button>
                          </div>
                          
                          {stepsVisible && (
                            <div className="bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-400/20 overflow-hidden">
                              {result.steps?.map((step, stepIndex) => (
                                <div 
                                  key={stepIndex} 
                                  className={`p-3 ${stepIndex !== (result.steps?.length || 0) - 1 ? 'border-b border-purple-400/10' : ''}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {stepIndex + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <div className="text-purple-200 text-sm font-medium">
                                        {step.description}
                                      </div>
                                      <div className="bg-black/40 backdrop-blur-sm rounded-md p-2 font-mono text-purple-300 text-sm border border-purple-400/20">
                                        {step.expression}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {result.result && result.result !== 'null' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
                            <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                              Final Answer
                            </label>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-lg p-3 border border-emerald-400/20">
                            <span className="text-emerald-300 font-mono text-lg sm:text-xl font-bold break-all">
                              {result.result}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        {onCopy && (
                          <button
                            onClick={() => onCopy(`${result.expr} = ${result.result}`)}
                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </button>
                        )}
                        {hasSteps && onCopy && (
                          <button
                            onClick={() => {
                              const stepsText = result.steps?.map((step, i) => `Step ${i + 1}: ${step.description}\n${step.expression}`).join('\n\n') || '';
                              onCopy(`${result.expr}\n\nMethod: ${result.method}\n\nSteps:\n${stepsText}\n\nAnswer: ${result.result}`);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Copy Steps
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}; 