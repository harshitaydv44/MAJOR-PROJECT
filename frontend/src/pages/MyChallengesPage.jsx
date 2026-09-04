import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import ChallengeTable from '../components/common/ChallengeTable';
import ChallengeCard from '../components/common/ChallengeCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Search, Filter, LayoutGrid, LayoutList, PlusCircle, RefreshCw } from 'lucide-react';

const categories = [
  'All Categories',
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

const statuses = [
  'All Statuses',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'SOLUTION_PROPOSED',
  'PILOT_TESTING',
  'RESOLVED',
  'REJECTED'
];

const MyChallengesPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'All Statuses';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [error, setError] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await problemService.getMyProblems();
      setProblems(res.data?.problems || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Failed to load your citizen challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Filter challenges
  const filteredChallenges = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All Categories' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Statuses' ||
      p.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gov-navy">
            My Submitted Challenges
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1">
            Complete registry of community problems reported by your account across Delhi districts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchProblems} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/client/submit">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Submit New Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gov-border rounded-sm p-4 shadow-gov-card flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-serif">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keyword, or DEL code..."
            className="w-full border border-gov-border rounded-xs pl-8 pr-3 py-2 text-xs font-serif focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          />
          <Search className="w-4 h-4 text-gov-text-muted absolute left-2.5 top-2.5" />
        </div>

        {/* Dropdowns and View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gov-border rounded-xs px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gov-border rounded-xs px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gov-border rounded-xs overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 ${
                viewMode === 'table' ? 'bg-gov-maroon text-white' : 'bg-white text-gov-navy hover:bg-gov-sand-50'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${
                viewMode === 'grid' ? 'bg-gov-maroon text-white' : 'bg-white text-gov-navy hover:bg-gov-sand-50'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <LoadingState message="Loading your challenges..." />
      ) : error ? (
        <Card accent="none">
          <ErrorState
            title="Failed to Load Challenges"
            message={error}
            onRetry={fetchProblems}
            retryLabel="Retry Loading"
          />
        </Card>
      ) : filteredChallenges.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Challenges Matching Criteria"
            description="Try clearing your search query or selecting 'All Categories' / 'All Statuses'."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedStatus('All Statuses');
            }}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card accent="none">
          <ChallengeTable
            challenges={filteredChallenges}
            emptyMessage="No challenges found."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((c) => (
            <ChallengeCard key={c._id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChallengesPage;
