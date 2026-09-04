import React from 'react';
import {
  DELHI_DISTRICTS,
  CHALLENGE_CATEGORIES,
  CHALLENGE_STATUSES,
  PRIORITY_LEVELS
} from '../../utils/constants';
import Button from './Button';
import { Search, RotateCcw, Calendar } from 'lucide-react';

const FilterBar = ({
  search = '',
  onSearchChange,
  category = 'All Categories',
  onCategoryChange,
  district = 'All Districts',
  onDistrictChange,
  status = 'All Statuses',
  onStatusChange,
  priority = 'All Priorities',
  onPriorityChange,
  urgency = 'All Urgencies',
  onUrgencyChange,
  dateFrom = '',
  onDateFromChange,
  dateTo = '',
  onDateToChange,
  onReset
}) => {
  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All Categories' ||
    district !== 'All Districts' ||
    status !== 'All Statuses' ||
    (priority && priority !== 'All Priorities') ||
    (urgency && urgency !== 'All Urgencies') ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="bg-white border border-gov-border rounded-sm p-4 shadow-gov-card space-y-3 font-serif text-xs">
      {/* Search Input and Primary Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search by ID, Title, or Keyword */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID (DEL-...), title, keyword..."
            className="w-full text-xs font-serif border border-gov-border rounded-xs pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
          <Search className="w-4 h-4 text-gov-text-muted absolute left-2.5 top-2.5" />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-xs font-serif border border-gov-border rounded-xs px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="All Statuses">All Statuses</option>
            {CHALLENGE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
            <option value="NEEDS_INFORMATION">Needs Information</option>
            <option value="DUPLICATE">Duplicate</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-xs font-serif border border-gov-border rounded-xs px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="All Categories">All Categories</option>
            {CHALLENGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full text-xs font-serif border border-gov-border rounded-xs px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gov-navy"
          >
            <option value="All Districts">All Districts (Delhi)</option>
            {DELHI_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Secondary Filters: Priority, Urgency, Date Range */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gov-border">
        <div className="flex flex-wrap items-center gap-3">
          {/* Priority */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-gov-navy uppercase">Priority:</span>
            <select
              value={priority}
              onChange={(e) => onPriorityChange && onPriorityChange(e.target.value)}
              className="text-xs border border-gov-border rounded-xs px-2 py-1 bg-white focus:ring-1 focus:ring-gov-navy"
            >
              <option value="All Priorities">All Priorities</option>
              {PRIORITY_LEVELS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-gov-navy uppercase">Urgency:</span>
            <select
              value={urgency}
              onChange={(e) => onUrgencyChange && onUrgencyChange(e.target.value)}
              className="text-xs border border-gov-border rounded-xs px-2 py-1 bg-white focus:ring-1 focus:ring-gov-navy"
            >
              <option value="All Urgencies">All Urgencies</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="immediate">Immediate</option>
            </select>
          </div>

          {/* Date Filter Range */}
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="text-[10px] font-bold text-gov-navy uppercase">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange && onDateFromChange(e.target.value)}
              className="border border-gov-border rounded-xs px-1.5 py-0.5 text-xs bg-white"
            />
            <span className="text-[10px] font-bold text-gov-navy uppercase">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange && onDateToChange(e.target.value)}
              className="border border-gov-border rounded-xs px-1.5 py-0.5 text-xs bg-white"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center text-xs text-gov-maroon hover:underline font-semibold cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
