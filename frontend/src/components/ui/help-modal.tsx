import React from 'react';
import { Button } from './button';
import { injectHelpModalStyles } from './help-modal-styles';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Ctrl + Z', action: 'Undo last action' },
    { key: 'Ctrl + Y / Ctrl + Shift + Z', action: 'Redo last undone action' },
    { key: 'Ctrl + R', action: 'Reset canvas' },
    { key: 'Enter', action: 'Calculate equation' },
    { key: 'E', action: 'Toggle eraser mode' },
    { key: 'Esc', action: 'Close this help dialog' },
  ];

  const tips = [
    'Draw mathematical expressions clearly with good spacing',
    'Use different brush sizes for better clarity',
    'The eraser tool helps make corrections',
    'Results can be dragged around the screen',
    'Copy results to clipboard using the copy button',
    'The app supports basic arithmetic, algebra, and calculus',
  ];

  React.useEffect(() => {
    // Inject styles
    injectHelpModalStyles();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">NeuroMath Help</h2>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Learn how to use the drawing calculator</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon-sm"
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Getting Started */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Getting Started
            </h3>
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <p className="text-gray-300 text-sm leading-relaxed">
                1. <strong className="text-white">Draw</strong> your mathematical expression on the black canvas using your mouse or touch
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                2. <strong className="text-white">Adjust</strong> brush size and color using the toolbar controls
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                3. <strong className="text-white">Calculate</strong> by clicking the Calculate button or pressing Enter
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                4. <strong className="text-white">View</strong> and drag the result to position it anywhere on screen
              </p>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          {/* Tips & Tricks */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips & Tricks
            </h3>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-black/30 rounded-lg p-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Supported Operations */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Supported Operations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Addition (+)', 'Subtraction (-)', 'Multiplication (×)', 'Division (÷)', 'Exponents (^)', 'Square Root (√)', 'Fractions', 'Parentheses'].map((op, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-2 text-center">
                  <span className="text-gray-300 text-xs">{op}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> to close
            </p>
            <Button onClick={onClose} variant="default" size="sm">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 