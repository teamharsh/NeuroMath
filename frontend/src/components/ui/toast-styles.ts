// Toast component styles
export const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
  }
`;

// Inject styles function
export const injectToastStyles = () => {
  if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('toast-styles');
    if (!existingStyle) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'toast-styles';
      styleSheet.textContent = toastStyles;
      document.head.appendChild(styleSheet);
    }
  }
}; 