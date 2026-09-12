import React from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water Management',
  'Sanitation',
  'Environment',
  'Energy',
  'Urban Infrastructure',
  'Accessibility',
  'Public Services',
  'Rural Livelihoods',
  'Other'
];

const DISTRICTS = [
  'Central Delhi',
  'East Delhi',
  'New Delhi',
  'North Delhi',
  'North East Delhi',
  'North West Delhi',
  'Shahdara',
  'South Delhi',
  'South East Delhi',
  'South West Delhi',
  'West Delhi'
];

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const STATUS_OPTIONS = [
  { value: 'VALIDATED', label: 'Validated (Open for Innovation)' },
  { value: 'ASSIGNED', label: 'Assigned to University' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved / Completed' }
];

const ChallengeFilters = ({ filters, onFilterChange, activeTab }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({
      category: '',
      district: '',
      priority: '',
      status: '',
      university: '',
      requiredSkills: '',
      search: ''
    });
  };

  return (
    <div className="bg-gov-sand-50 border border-gov-border rounded-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gov-text-muted" />
            <input
              type="text"
              placeholder="Search by title, description, or code..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            District
          </label>
          <select
            value={filters.district || ''}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          >
            <option value="">All Districts</option>
            {DISTRICTS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((prio) => (
              <option key={prio} value={prio}>
                {prio.charAt(0).toUpperCase() + prio.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* University */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            University
          </label>
          <input
            type="text"
            placeholder="e.g. DTU, NSUT, IIIT-D..."
            value={filters.university || ''}
            onChange={(e) => handleChange('university', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-[10px] font-serif font-semibold text-gov-text-secondary uppercase mb-1">
            Required Skills
          </label>
          <input
            type="text"
            placeholder="e.g. IoT, Solar, Water, AI..."
            value={filters.requiredSkills || ''}
            onChange={(e) => handleChange('requiredSkills', e.target.value)}
            className="w-full px-3 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-white"
          />
        </div>
      </div>

      {/* Reset Row */}
      <div className="flex justify-end mt-4 pt-3 border-t border-gov-border/60">
        <button
          onClick={handleReset}
          className="px-4 py-1.5 text-xs font-serif border border-gov-border rounded-sm hover:bg-gov-sand-100 text-gov-text-secondary transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default ChallengeFilters;
