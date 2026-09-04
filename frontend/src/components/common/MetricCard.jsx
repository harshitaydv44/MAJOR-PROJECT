import React from 'react';

const colorStyles = {
  maroon: {
    border: 'border-l-4 border-l-gov-maroon',
    iconBg: 'bg-gov-maroon-surface text-gov-maroon',
    badge: 'text-gov-maroon bg-gov-maroon-surface'
  },
  navy: {
    border: 'border-l-4 border-l-gov-navy',
    iconBg: 'bg-gov-navy-surface text-gov-navy',
    badge: 'text-gov-navy bg-gov-navy-surface'
  },
  amber: {
    border: 'border-l-4 border-l-amber-600',
    iconBg: 'bg-amber-50 text-amber-700',
    badge: 'text-amber-800 bg-amber-50'
  },
  emerald: {
    border: 'border-l-4 border-l-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-700',
    badge: 'text-emerald-800 bg-emerald-50'
  },
  blue: {
    border: 'border-l-4 border-l-blue-600',
    iconBg: 'bg-blue-50 text-blue-700',
    badge: 'text-blue-800 bg-blue-50'
  },
  indigo: {
    border: 'border-l-4 border-l-indigo-600',
    iconBg: 'bg-indigo-50 text-indigo-700',
    badge: 'text-indigo-800 bg-indigo-50'
  },
  purple: {
    border: 'border-l-4 border-l-purple-600',
    iconBg: 'bg-purple-50 text-purple-700',
    badge: 'text-purple-800 bg-purple-50'
  },
  cyan: {
    border: 'border-l-4 border-l-cyan-600',
    iconBg: 'bg-cyan-50 text-cyan-700',
    badge: 'text-cyan-800 bg-cyan-50'
  }
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon = null,
  accent = 'navy',
  badgeText = null,
  onClick
}) => {
  const currentStyle = colorStyles[accent] || colorStyles.navy;

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gov-border rounded-sm p-4 shadow-gov-card hover:shadow-gov-hover transition-all duration-150 flex items-center justify-between ${
        currentStyle.border
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5">
          <span className="text-[11px] font-serif font-bold text-gov-text-secondary uppercase tracking-wider">
            {title}
          </span>
          {badgeText && (
            <span className={`text-[10px] font-serif px-1.5 py-0.2 rounded-xs font-semibold ${currentStyle.badge}`}>
              {badgeText}
            </span>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-none">
          {value !== undefined ? value : '--'}
        </div>

        {subtitle && (
          <p className="text-[11px] font-serif text-gov-text-muted truncate max-w-[170px]">
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          className={`w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0 ${
            currentStyle.iconBg
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default MetricCard;
