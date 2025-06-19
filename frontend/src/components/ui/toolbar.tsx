import React from 'react';
import { Button } from './button';
import { ColorSwatch } from '@mantine/core';
import { SWATCHES } from '@/constants';

interface ToolbarProps {
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCalculate: () => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onEraserToggle: () => void;
  onHelpToggle: () => void;
  onSidebarToggle?: () => void;
  onStepModeToggle?: () => void;
  currentColor: string;
  currentBrushSize: number;
  isEraser: boolean;
  isLoading: boolean;
  canUndo: boolean;
  canRedo: boolean;
  sidebarVisible?: boolean;
  stepModeEnabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onReset,
  onUndo,
  onRedo,
  onCalculate,
  onColorChange,
  onBrushSizeChange,
  onEraserToggle,
  onHelpToggle,
  onSidebarToggle,
  onStepModeToggle,
  currentColor,
  currentBrushSize,
  isEraser,
  isLoading,
  canUndo,
  canRedo,
  sidebarVisible = false,
  stepModeEnabled = false,
}) => {
  const [showColorPalette, setShowColorPalette] = React.useState(false);
  const [showBrushSizes, setShowBrushSizes] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const brushSizes = [1, 2, 3, 5, 8, 12, 16, 20];

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowColorPalette(false);
      setShowBrushSizes(false);
    };
    
    if (showColorPalette || showBrushSizes) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColorPalette, showBrushSizes]);

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="fixed top-0 left-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-30">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Left Section - Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <Button onClick={onReset} variant="tool" size="icon-sm" title="Reset Canvas">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </Button>
                <Button onClick={onUndo} variant="tool" size="icon-sm" disabled={!canUndo} title="Undo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>
                <Button onClick={onRedo} variant="tool" size="icon-sm" disabled={!canRedo} title="Redo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Center Section - Drawing Tools */}
            <div className="flex items-center gap-2">
              {/* Brush/Eraser Toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <Button
                  onClick={onEraserToggle}
                  variant={isEraser ? "default" : "tool"}
                  size="icon-sm"
                  title={isEraser ? "Switch to Brush" : "Switch to Eraser"}
                >
                  {isEraser ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </Button>
              </div>

              {/* Brush Size */}
              <div className="relative">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBrushSizes(!showBrushSizes);
                    setShowColorPalette(false);
                  }}
                  variant="tool"
                  size="sm"
                  className="min-w-[80px]"
                >
                  <div 
                    className="w-3 h-3 bg-white rounded-full mr-2"
                    style={{ 
                      width: `${Math.min(currentBrushSize * 2, 12)}px`, 
                      height: `${Math.min(currentBrushSize * 2, 12)}px` 
                    }}
                  />
                  {currentBrushSize}px
                </Button>
                
                {showBrushSizes && (
                  <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[120px] z-50 border border-white/10">
                    <div className="grid grid-cols-4 gap-2">
                      {brushSizes.map((size) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBrushSizeChange(size);
                            setShowBrushSizes(false);
                          }}
                          className={`flex items-center justify-center p-2 rounded hover:bg-white/10 transition-colors ${
                            currentBrushSize === size ? 'bg-white/20' : ''
                          }`}
                        >
                          <div 
                            className="bg-white rounded-full"
                            style={{ 
                              width: `${Math.min(size * 2, 16)}px`, 
                              height: `${Math.min(size * 2, 16)}px` 
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Palette */}
              <div className="relative">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPalette(!showColorPalette);
                    setShowBrushSizes(false);
                  }}
                  variant="tool"
                  size="sm"
                  className="min-w-[80px]"
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border border-white/30"
                    style={{ backgroundColor: currentColor }}
                  />
                  Color
                </Button>
                
                {showColorPalette && (
                  <div className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-3 z-50 border border-white/10">
                    <div className="grid grid-cols-6 gap-2 max-w-[200px]">
                      {SWATCHES.map((swatch) => (
                        <ColorSwatch
                          key={swatch}
                          color={swatch}
                          onClick={(e) => {
                            e.stopPropagation();
                            onColorChange(swatch);
                            setShowColorPalette(false);
                          }}
                          className="cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            width: "24px",
                            height: "24px",
                            border: currentColor === swatch ? "2px solid white" : "1px solid rgba(255,255,255,0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Calculate & Help */}
            <div className="flex items-center gap-2">
              {onStepModeToggle && (
                <Button
                  onClick={onStepModeToggle}
                  variant={stepModeEnabled ? "default" : "tool"}
                  size="sm"
                  title={stepModeEnabled ? "Disable Step-by-Step Mode" : "Enable Step-by-Step Mode"}
                  className="min-w-[100px]"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2z"/>
                    </svg>
                    <span>Steps</span>
                  </div>
                </Button>
              )}
              {onSidebarToggle && (
                <Button
                  onClick={onSidebarToggle}
                  variant="tool"
                  size="icon-sm"
                  title={sidebarVisible ? "Hide Solutions Panel" : "Show Solutions Panel"}
                >
                  <svg className={`w-4 h-4 transition-transform duration-200 ${!sidebarVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              )}
              <Button onClick={onHelpToggle} variant="tool" size="icon-sm" title="Help & Shortcuts">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
              <Button
                onClick={onCalculate}
                variant="success"
                size="sm"
                disabled={isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Calculate
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              {/* Left - Essential Actions */}
              <div className="flex items-center gap-1">
                <Button onClick={onEraserToggle} variant={isEraser ? "default" : "tool"} size="icon-sm">
                  {isEraser ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </Button>
                <Button onClick={onUndo} variant="tool" size="icon-sm" disabled={!canUndo}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>
                <Button onClick={onRedo} variant="tool" size="icon-sm" disabled={!canRedo}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                  </svg>
                </Button>
              </div>

              {/* Center - Calculate Button */}
              <Button
                onClick={onCalculate}
                variant="success"
                size="sm"
                disabled={isLoading}
                className="px-4 sm:px-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Calculate</span>
                  </div>
                )}
              </Button>

              {/* Right - Menu Toggle */}
              <div className="flex items-center gap-1">
                <Button onClick={onHelpToggle} variant="tool" size="icon-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  variant="tool"
                  size="icon-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="fixed top-16 left-0 w-full bg-black/90 backdrop-blur-md border-b border-white/10 z-40 lg:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Tool Selection */}
              <div className="space-y-3">
                <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider">Tools</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowBrushSizes(!showBrushSizes);
                      setShowColorPalette(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <div 
                      className="w-4 h-4 bg-white rounded-full"
                      style={{ 
                        width: `${Math.min(currentBrushSize * 2, 16)}px`, 
                        height: `${Math.min(currentBrushSize * 2, 16)}px` 
                      }}
                    />
                    <span className="text-white text-sm">Brush Size: {currentBrushSize}px</span>
                  </button>
                  
                  {showBrushSizes && (
                    <div className="grid grid-cols-4 gap-2 p-2 bg-black/50 rounded-lg">
                      {brushSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            onBrushSizeChange(size);
                            setShowBrushSizes(false);
                          }}
                          className={`flex items-center justify-center p-3 rounded transition-colors ${
                            currentBrushSize === size ? 'bg-white/20' : 'hover:bg-white/10'
                          }`}
                        >
                          <div 
                            className="bg-white rounded-full"
                            style={{ 
                              width: `${Math.min(size * 2, 16)}px`, 
                              height: `${Math.min(size * 2, 16)}px` 
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowColorPalette(!showColorPalette);
                      setShowBrushSizes(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-white/30"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-white text-sm">Color</span>
                  </button>
                  
                  {showColorPalette && (
                    <div className="grid grid-cols-6 gap-2 p-2 bg-black/50 rounded-lg">
                      {SWATCHES.map((swatch) => (
                        <ColorSwatch
                          key={swatch}
                          color={swatch}
                          onClick={() => {
                            onColorChange(swatch);
                            setShowColorPalette(false);
                          }}
                          className="cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            width: "32px",
                            height: "32px",
                            border: currentColor === swatch ? "2px solid white" : "1px solid rgba(255,255,255,0.3)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider">Actions</h3>
                <div className="space-y-2">
                  <Button onClick={onReset} variant="outline" size="sm" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Canvas
                  </Button>
                  {onSidebarToggle && (
                    <Button
                      onClick={() => {
                        onSidebarToggle();
                        setShowMobileMenu(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {sidebarVisible ? "Hide Solutions" : "Show Solutions"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-transparent z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
          style={{ top: '140px' }}
        />
      )}
    </>
  );
}; 