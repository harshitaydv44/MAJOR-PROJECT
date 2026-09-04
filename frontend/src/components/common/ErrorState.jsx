import React from 'react';
import Button from './Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  icon: Icon = AlertTriangle,
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the Delhi Portal API.',
  onRetry,
  retryLabel = 'Retry Connection'
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto font-serif">
      <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-gov-red flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-gov-navy mb-1.5">{title}</h3>
      <p className="text-xs text-gov-text-secondary leading-relaxed mb-5">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="inline-flex items-center gap-2 border-gov-red text-gov-red hover:bg-red-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
