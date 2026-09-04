import React from 'react';

const statusConfig = {
  SUBMITTED: {
    label: 'Submitted',
    classes: 'bg-stone-100 text-stone-700 border-stone-300'
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    classes: 'bg-amber-50 text-amber-800 border-amber-300'
  },
  NEEDS_INFORMATION: {
    label: 'Needs Information',
    classes: 'bg-orange-50 text-orange-800 border-orange-300'
  },
  VALIDATED: {
    label: 'Validated',
    classes: 'bg-blue-50 text-blue-800 border-blue-300'
  },
  ASSIGNED: {
    label: 'Assigned',
    classes: 'bg-indigo-50 text-indigo-800 border-indigo-300'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-yellow-50 text-yellow-800 border-yellow-300'
  },
  SOLUTION_PROPOSED: {
    label: 'Solution Proposed',
    classes: 'bg-purple-50 text-purple-800 border-purple-300'
  },
  PILOT_TESTING: {
    label: 'Pilot Testing',
    classes: 'bg-cyan-50 text-cyan-800 border-cyan-300'
  },
  RESOLVED: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-rose-50 text-rose-800 border-rose-300'
  },
  DUPLICATE: {
    label: 'Duplicate',
    classes: 'bg-zinc-100 text-zinc-700 border-zinc-300'
  }
};

const StatusBadge = ({ status = 'SUBMITTED', className = '' }) => {
  const normalized = (status || 'SUBMITTED').toUpperCase().replace(/\s+/g, '_');
  const conf = statusConfig[normalized] || {
    label: status,
    classes: 'bg-stone-100 text-stone-700 border-stone-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-serif font-medium border rounded-xs whitespace-nowrap ${conf.classes} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {conf.label}
    </span>
  );
};

export default StatusBadge;
