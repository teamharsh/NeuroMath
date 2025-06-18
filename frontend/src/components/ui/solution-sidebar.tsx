import React, { useState, useEffect } from 'react';

interface SolutionSidebarProps {
  results: Array<{
    expr: string;
    result: string;
  }>;
  onCopy?: (text: string) => void;
  onClear?: () => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const SolutionSidebar: React.FC<SolutionSidebarProps> = ({
  results,
  onCopy,
  onClear,
  isVisible,
  onToggle,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
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

                      {result.result && result.result !== 'null' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-400 rounded-full"></div>
                            <label className="text-xs font-medium text-white/90 uppercase tracking-wider">
                              Result
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