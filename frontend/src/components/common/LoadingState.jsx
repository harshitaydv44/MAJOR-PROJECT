import React from 'react';

const LoadingState = ({ message = 'Loading citizen data from Delhi portal...' }) => {
  return (
    <div className="py-16 text-center max-w-sm mx-auto font-serif">
      <div className="w-9 h-9 border-3 border-gov-maroon border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-xs text-gov-text-muted">{message}</p>
    </div>
  );
};

export default LoadingState;
