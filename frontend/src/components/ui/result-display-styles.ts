// Result display styles
export const resultDisplayStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideInScale {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.9) rotateX(15deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
    }
  }

  @keyframes pulseGlow {
    0%, 100% {
      opacity: 1;
      box-shadow: 0 0 8px currentColor;
    }
    50% {
      opacity: 0.7;
      box-shadow: 0 0 16px currentColor;
    }
  }

  @keyframes pulseSlow {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-slideInScale {
    animation: slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulseSlow 3s ease-in-out infinite;
  }

  .result-card {
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  /* Only apply hover effects when not being dragged */
  .result-card:hover:not(.react-draggable-dragging) {
    transform: translateY(-2px);
    transition: transform 0.3s ease;
  }

  /* Drag handle specific styles */
  .drag-handle {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .drag-handle:active {
    cursor: grabbing !important;
  }

  /* Disable hover effects during dragging */
  .react-draggable-dragging {
    pointer-events: auto !important;
  }

  .react-draggable-dragging .result-card {
    transform: none !important;
    transition: none !important;
  }

  .react-draggable-dragging * {
    pointer-events: none !important;
  }

  .react-draggable-dragging .drag-handle {
    pointer-events: auto !important;
  }

  /* Shimmer effect - only when not dragging */
  .result-card:not(.react-draggable-dragging)::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.5s ease;
    pointer-events: none;
  }

  .result-card:hover:not(.react-draggable-dragging)::before {
    left: 100%;
  }

  /* Ensure proper touch handling on mobile */
  @media (hover: none) and (pointer: coarse) {
    .drag-handle {
      cursor: grab;
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
  }

  /* Custom scrollbar for long expressions */
  .result-card ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .result-card ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  .result-card ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .result-card ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// Inject styles function
export const injectResultDisplayStyles = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('result-display-styles');
    if (!existingStyle) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'result-display-styles';
      styleSheet.textContent = resultDisplayStyles;
      document.head.appendChild(styleSheet);
    }
  }
}; 