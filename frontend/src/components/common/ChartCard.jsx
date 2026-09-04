import React from 'react';

const ChartCard = ({
  title,
  subtitle,
  children,
  badge = null,
  action = null,
  accent = 'none', // 'none' | 'maroon' | 'navy'
  className = ''
}) => {
  const accentClasses = {
    none: '',
    maroon: 'border-t-3 border-t-gov-maroon',
    navy: 'border-t-3 border-t-gov-navy'
  };

  return (
    <div
      className={`bg-white border border-gov-border rounded-sm shadow-gov-card p-4 sm:p-5 flex flex-col justify-between ${
        accentClasses[accent] || ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-4 border-b border-gov-border pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif font-bold text-gov-navy text-sm sm:text-base leading-tight">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-serif font-semibold px-2 py-0.5 rounded-xs bg-gov-sand-100 text-gov-navy border border-gov-border">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-serif text-gov-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>

      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
