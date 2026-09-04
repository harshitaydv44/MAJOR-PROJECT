import React from 'react';
import Button from './Button';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are no active submissions or challenges under this section.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto font-serif">
      <div className="w-14 h-14 rounded-full bg-gov-sand-100 border border-gov-border text-gov-text-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-gov-navy mb-1.5">{title}</h3>
      <p className="text-xs text-gov-text-secondary leading-relaxed mb-5">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
