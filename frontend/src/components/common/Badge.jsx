import React from 'react';

const Badge = ({
  children,
  variant = 'maroon',
  className = ''
}) => {
  const variantStyles = {
    maroon: 'bg-gov-maroon-surface text-gov-maroon border-gov-maroon-border',
    navy: 'bg-gov-navy-surface text-gov-navy border-gov-navy-border',
    gold: 'bg-amber-50 text-amber-800 border-amber-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-serif font-medium border rounded-sm ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
