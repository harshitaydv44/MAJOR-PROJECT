import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import ChallengeTable from '../components/common/ChallengeTable';
import ChallengeCard from '../components/common/ChallengeCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  'REJECTED',
  'NEEDS_INFORMATION'
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Recently Updated', value: 'updated' },
  { label: 'Priority', value: 'priority' }
];

const MyChallengesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatusFilter = searchParams.get('status') || 'All Statuses';

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);
  const [selectedSort, setSelectedSort] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchProblems = useCallback(async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 15,
        sort: selectedSort
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All Categories') params.category = selectedCategory;
      if (selectedStatus !== 'All Statuses') params.status = selectedStatus;

      const res = await problemService.getMyProblems(params);
      const data = res?.data || {};
      setProblems(data.problems || []);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          page: currentPage,
          limit: 15,
          total: data.count || (data.problems || []).length,
          totalPages: Math.ceil((data.count || (data.problems || []).length) / 15) || 1
        });
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Failed to load your citizen challenges.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedSort, page]);

  // Refetch when filters change
  useEffect(() => {
    fetchProblems(1);
    setPage(1);
  }, [selectedCategory, selectedStatus, selectedSort]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProblems(1);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      fetchProblems(newPage);
    }
  };

  return (
    <div className="space-y-6 font-serif">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">
            My Submitted Challenges
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Complete registry of community problems reported by your account across Delhi districts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={() => fetchProblems(page)} icon={RefreshCw}>
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
      <div className="bg-white border border-gov-border rounded-sm p-4 shadow-gov-card flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keyword, or DEL code..."
            className="w-full border border-gov-border rounded-xs pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          />
          <Search className="w-4 h-4 text-gov-text-muted absolute left-2.5 top-2.5" />
        </div>

        {/* Dropdowns and View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gov-maroon"
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
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setSearchParams(e.target.value !== 'All Statuses' ? { status: e.target.value } : {});
            }}
            className="border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="border border-gov-border rounded-xs px-2.5 py-1.5 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gov-maroon"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gov-border rounded-xs overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 ${
                viewMode === 'table'
                  ? 'bg-gov-maroon text-white'
                  : 'bg-white text-gov-navy hover:bg-gov-sand-50'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-gov-maroon text-white'
                  : 'bg-white text-gov-navy hover:bg-gov-sand-50'
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
            onRetry={() => fetchProblems(page)}
            retryLabel="Retry Loading"
          />
        </Card>
      ) : problems.length === 0 ? (
        <Card accent="none">
          <EmptyState
            title="No Challenges Matching Criteria"
            description="Try clearing your search query or resetting filters to 'All Categories' and 'All Statuses'."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedStatus('All Statuses');
              setSearchParams({});
            }}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <div className="space-y-4">
          <Card accent="none">
            <ChallengeTable
              challenges={problems}
              emptyMessage="No challenges found."
            />
          </Card>

          {/* Pagination bar */}
          {pagination.totalPages > 1 && (
            <div className="bg-white border border-gov-border rounded-xs px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-gov-text-muted">
                Showing Page <strong>{pagination.page}</strong> of{' '}
                <strong>{pagination.totalPages}</strong> ({pagination.total} records total)
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  variant="subtle"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((c) => (
              <ChallengeCard key={c._id} challenge={c} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="bg-white border border-gov-border rounded-xs px-4 py-2.5 flex items-center justify-between text-xs">
              <span className="text-gov-text-muted">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="subtle"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyChallengesPage;
