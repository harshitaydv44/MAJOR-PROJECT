import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import AssignUniversityModal from '../../components/admin/AssignUniversityModal';
import WorkflowActionModal from '../../components/admin/WorkflowActionModal';
import { Eye, Check, XCircle, Share2, RefreshCw } from 'lucide-react';

const AdminChallengesPage = () => {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [district, setDistrict] = useState('All Districts');
  const [status, setStatus] = useState('All Statuses');
  const [priority, setPriority] = useState('All Priorities');
  const [urgency, setUrgency] = useState('All Urgencies');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [workflowModal, setWorkflowModal] = useState(null); // { challenge, mode }
  const [assigningChallenge, setAssigningChallenge] = useState(null);

  const [error, setError] = useState('');

  const fetchChallenges = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getChallenges({
        search,
        category,
        district,
        status,
        priority,
        urgency,
        dateFrom,
        dateTo,
        page,
        limit: 10,
        sortBy,
        sortOrder
      });

      setChallenges(res.data?.challenges || []);
      setPagination(res.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.message || 'Failed to load challenges from state registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges(1);
  }, [category, district, status, priority, urgency, dateFrom, dateTo, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChallenges(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setDistrict('All Districts');
    setStatus('All Statuses');
    setPriority('All Priorities');
    setUrgency('All Urgencies');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const columns = [
    {
      header: 'Challenge ID',
      accessor: 'code',
      sortable: true,
      className: 'w-24',
      render: (row) => (
        <span
          onClick={() => navigate(`/admin/challenges/${row._id}`)}
          className="font-mono font-bold text-gov-maroon hover:underline cursor-pointer"
        >
          {row.code || `DEL-${row._id.slice(-4).toUpperCase()}`}
        </span>
      )
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <span
            onClick={() => navigate(`/admin/challenges/${row._id}`)}
            className="font-bold text-gov-navy hover:text-gov-maroon cursor-pointer line-clamp-1"
          >
            {row.title}
          </span>
          {row.location?.landmark && (
            <span className="text-[10px] text-gov-text-muted truncate block">
              Near {row.location.landmark}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-gov-text-secondary">{row.category}</span>
    },
    {
      header: 'District',
      accessor: 'district',
      sortable: true,
      render: (row) => <span className="font-medium text-gov-navy">{row.district}</span>
    },
    {
      header: 'Submitted By',
      accessor: 'submittedBy',
      render: (row) => (
        <div>
          <div className="font-medium text-gov-navy">{row.submittedBy?.name || 'Citizen'}</div>
          <div className="text-[10px] text-gov-text-muted truncate max-w-[120px]">
            {row.submittedBy?.organization || 'Resident'}
          </div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-gov-text-muted">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      )
    },
    {
      header: 'Urgency',
      accessor: 'urgency',
      sortable: true,
      render: (row) => (
        <span
          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
            row.urgency === 'immediate'
              ? 'bg-red-100 text-red-800 font-extrabold'
              : row.urgency === 'high'
              ? 'bg-amber-100 text-amber-900'
              : 'bg-stone-100 text-stone-700'
          }`}
        >
          {row.urgency || 'medium'}
        </span>
      )
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (row) => (
        <span
          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
            row.priority === 'critical'
              ? 'bg-rose-100 text-rose-800'
              : row.priority === 'high'
              ? 'bg-yellow-100 text-yellow-900'
              : 'bg-stone-100 text-stone-700'
          }`}
        >
          {row.priority || 'medium'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      className: 'text-right min-w-[210px]',
      render: (row) => {
        const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION'].includes(
          row.status?.toUpperCase()
        );

        return (
          <div className="flex items-center justify-end space-x-1">
            <Button
              variant="subtle"
              size="sm"
              onClick={() => navigate(`/admin/challenges/${row._id}`)}
              title="Full Inspection"
              icon={Eye}
            >
              View
            </Button>

            {isPending && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setWorkflowModal({ challenge: row, mode: 'VALIDATE' })}
                  title="Validate"
                  className="bg-emerald-700 hover:bg-emerald-800"
                  icon={Check}
                >
                  Validate
                </Button>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setWorkflowModal({ challenge: row, mode: 'REJECT' })}
                  title="Reject"
                  className="text-rose-700 hover:bg-rose-50"
                  icon={XCircle}
                >
                  Reject
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssigningChallenge(row)}
              title="Assign to University"
              icon={Share2}
            >
              Assign
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 font-serif">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Challenge Management Registry
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Comprehensive directory of societal problem submissions across Delhi. Search, filter by urgency and priority, and trigger state validation workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => fetchChallenges(pagination.page)}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        district={district}
        onDistrictChange={setDistrict}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        urgency={urgency}
        onUrgencyChange={setUrgency}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onReset={handleResetFilters}
      />

      {/* Table Card */}
      <Card accent="none">
        <DataTable
          columns={columns}
          data={challenges}
          loading={loading}
          error={error}
          onRetry={() => fetchChallenges(pagination.page)}
          pagination={pagination}
          onPageChange={(p) => fetchChallenges(p)}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyMessage="No challenges match the active filter criteria."
        />
      </Card>

      {/* Workflow Modal */}
      {workflowModal && (
        <WorkflowActionModal
          challenge={workflowModal.challenge}
          mode={workflowModal.mode}
          onClose={() => setWorkflowModal(null)}
          onSuccess={() => fetchChallenges(pagination.page)}
        />
      )}

      {/* Assign University Modal */}
      {assigningChallenge && (
        <AssignUniversityModal
          challenge={assigningChallenge}
          onClose={() => setAssigningChallenge(null)}
          onSuccess={() => fetchChallenges(pagination.page)}
        />
      )}
    </div>
  );
};

export default AdminChallengesPage;
