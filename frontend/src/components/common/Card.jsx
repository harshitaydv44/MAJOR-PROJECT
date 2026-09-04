import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  accent = 'none', // 'maroon', 'navy', 'gold', 'none'
  ...props
}) => {
  const accentTopBorders = {
    maroon: 'border-t-4 border-t-gov-maroon',
    navy: 'border-t-4 border-t-gov-navy',
    gold: 'border-t-4 border-t-gov-gold',
    none: ''
  };

  return (
    <div
      className={`bg-white border border-gov-border rounded-sm shadow-gov-card overflow-hidden ${
        accentTopBorders[accent] || ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gov-border bg-gov-sand-50 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-serif font-semibold text-gov-navy">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-serif text-gov-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="p-6">{children}</div>

      {footer && (
        <div className="px-6 py-3 border-t border-gov-border bg-gov-sand-100/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
