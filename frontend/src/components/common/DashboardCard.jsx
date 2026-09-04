import React from 'react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon = null,
  accent = 'maroon', // maroon | navy | amber | emerald | blue
  onClick
}) => {
  const accentBorders = {
    maroon: 'border-l-4 border-l-gov-maroon',
    navy: 'border-l-4 border-l-gov-navy',
    amber: 'border-l-4 border-l-amber-600',
    emerald: 'border-l-4 border-l-emerald-600',
    blue: 'border-l-4 border-l-blue-600'
  };

  const iconBg = {
    maroon: 'bg-gov-maroon-surface text-gov-maroon',
    navy: 'bg-gov-navy-surface text-gov-navy',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gov-border rounded-sm p-5 shadow-gov-card hover:shadow-gov-hover transition-all duration-150 flex items-center justify-between ${
        accentBorders[accent] || accentBorders.maroon
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div>
        <span className="text-xs font-serif font-semibold text-gov-text-secondary uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-3xl font-serif font-bold text-gov-navy leading-none">
          {value !== undefined ? value : '--'}
        </div>
        {subtitle && (
          <p className="text-[11px] font-serif text-gov-text-muted mt-1.5">
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 ${
            iconBg[accent] || iconBg.maroon
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
