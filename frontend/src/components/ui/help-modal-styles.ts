// Help modal styles
export const helpModalStyles = `
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

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

// Inject styles function
export const injectHelpModalStyles = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('help-modal-styles');
    if (!existingStyle) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'help-modal-styles';
      styleSheet.textContent = helpModalStyles;
      document.head.appendChild(styleSheet);
    }
  }
}; 