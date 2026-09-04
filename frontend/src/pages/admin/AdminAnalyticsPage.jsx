import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import MetricCard from '../../components/common/MetricCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  MapPin,
  RefreshCw,
  Layers,
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Sparkles,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { DELHI_DISTRICTS, CHALLENGE_CATEGORIES } from '../../utils/constants';

const DELHI_PALETTE = ['#142a45', '#7a1f2d', '#059669', '#b8860b', '#2563eb', '#6b7280', '#9333ea', '#0891b2', '#d97706'];

const STATUS_COLORS = {
  SUBMITTED: '#6b7280',
  UNDER_REVIEW: '#d97706',
  VALIDATED: '#2563eb',
  ASSIGNED: '#4f46e5',
  IN_PROGRESS: '#b8860b',
  SOLUTION_PROPOSED: '#9333ea',
  PILOT_TESTING: '#0891b2',
  RESOLVED: '#059669',
  REJECTED: '#e11d48'
};

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'geography' | 'institutions' | 'lifecycle' | 'impact'
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    dateRange: 'all',
    district: 'All Districts',
    category: 'All Categories',
    status: 'All Statuses',
    projectStage: 'All Stages'
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAnalytics(filters);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to aggregate MongoDB analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportCSV = async () => {
    setDownloadingCsv(true);
    try {
      const blob = await adminService.exportAnalyticsCSV(filters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `delhi_societal_innovation_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setDownloadingCsv(false);
    }
  };

  if (loading && !data) {
    return <LoadingState message="Aggregating State Innovation Council intelligence & MongoDB analytics..." />;
  }

  if (error && !data) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to Load Analytics"
          message={error}
          onRetry={fetchAnalytics}
          retryLabel="Retry Analytics Aggregation"
        />
      </div>
    );
  }

  const { kpis = {}, impactMetrics = {}, charts = {} } = data || {};

  return (
    <div className="space-y-6 font-serif max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gov-maroon font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-gov-maroon" />
            <span>Delhi State Innovation Council &bull; Executive Monitoring Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gov-navy">
            Government Analytics & Civic Impact Intelligence
          </h1>
          <p className="text-xs text-gov-text-secondary mt-1">
            Real-time public-sector analytics synthesized via MongoDB aggregations across Delhi's 11 administrative zones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="subtle" size="sm" onClick={fetchAnalytics} icon={RefreshCw}>
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            disabled={downloadingCsv}
            icon={Download}
            className="bg-gov-navy hover:bg-gov-navy-dark text-white"
          >
            {downloadingCsv ? 'Exporting...' : 'Export CSV Report'}
          </Button>
        </div>
      </div>

      {/* Multi-Facet Interactive Filter Ribbon */}
      <div className="bg-white border border-gov-border rounded-xs p-4 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-gov-navy uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-gov-maroon" />
          <span>Multi-Dimensional Intelligence Filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Time Horizon */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Time Horizon</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white outline-none text-xs font-serif"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Past 1 Year</option>
            </select>
          </div>

          {/* 2. District */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Administrative District</label>
            <select
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white outline-none text-xs font-serif"
            >
              <option value="All Districts">All 11 Districts</option>
              {DELHI_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 3. Category */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Societal Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white outline-none text-xs font-serif"
            >
              <option value="All Categories">All Categories</option>
              {CHALLENGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. Status */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Challenge Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white outline-none text-xs font-serif"
            >
              <option value="All Statuses">All Statuses</option>
              {Object.keys(STATUS_COLORS).map((st) => (
                <option key={st} value={st}>{st.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* 5. Project Stage */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Project Stage</label>
            <select
              value={filters.projectStage}
              onChange={(e) => handleFilterChange('projectStage', e.target.value)}
              className="w-full border border-gov-border rounded-xs px-2.5 py-1.5 bg-white outline-none text-xs font-serif"
            >
              <option value="All Stages">All 11 Stages</option>
              <option value="CHALLENGE_ACCEPTED">Challenge Accepted</option>
              <option value="PROJECT_CREATED">Project Created</option>
              <option value="PROPOSAL_SUBMITTED">Proposal Submitted</option>
              <option value="APPROVED">Council Approved</option>
              <option value="RESEARCH">Research</option>
              <option value="PROTOTYPE">Prototype</option>
              <option value="TESTING">Testing</option>
              <option value="PILOT">Pilot</option>
              <option value="VALIDATION">Validation</option>
              <option value="DEPLOYMENT">Deployment</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 1: 9 Core Government KPI Cards */}
      <div className="space-y-2">
        <span className="font-bold text-gov-navy uppercase text-xs tracking-wider block">
          State Operational & Stakeholder KPIs
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          <MetricCard
            title="Total Challenges"
            value={kpis.totalChallenges || 0}
            subtitle="Citizen submissions"
            accent="maroon"
          />
          <MetricCard
            title="Validated"
            value={kpis.validatedChallenges || 0}
            subtitle="State verified"
            accent="blue"
          />
          <MetricCard
            title="Active Projects"
            value={kpis.activeProjects || 0}
            subtitle="Under development"
            accent="indigo"
          />
          <MetricCard
            title="Completed"
            value={kpis.completedProjects || 0}
            subtitle="Fully deployed"
            accent="emerald"
          />
          <MetricCard
            title="Resolved"
            value={kpis.resolvedChallenges || 0}
            subtitle="Civic relief"
            accent="teal"
          />
          <MetricCard
            title="Universities"
            value={kpis.participatingUniversities || 0}
            subtitle="Institutions"
            accent="gold"
          />
          <MetricCard
            title="Industry Partners"
            value={kpis.industryPartners || 0}
            subtitle="Corporate co-sponsors"
            accent="purple"
          />
          <MetricCard
            title="Students"
            value={kpis.studentsInvolved || 0}
            subtitle="Innovator cohort"
            accent="sky"
          />
          <MetricCard
            title="Faculty Mentors"
            value={kpis.facultyMentors || 0}
            subtitle="Academic supervisors"
            accent="amber"
          />
        </div>
      </div>

      {/* SECTION 2: Verified Societal Impact Ledger */}
      <Card accent="emerald" title="Verified Societal Impact & Civic Relief Ledger">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          <div className="p-3 bg-emerald-50/60 rounded-xs border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-800">
              {(impactMetrics.peopleBenefited || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] uppercase font-bold text-emerald-950 mt-1">
              People Benefited
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-navy">
              {impactMetrics.projectsDeployed || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Projects Deployed
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-navy">
              {impactMetrics.communitiesCovered || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Communities Covered
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-navy">
              {impactMetrics.solutionsPiloted || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Solutions Piloted
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-maroon">
              {impactMetrics.patentsGenerated || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Patents / IP Filed
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-navy">
              {impactMetrics.startupsCreated || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Startups Created
            </div>
          </div>

          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <div className="text-2xl font-bold text-gov-navy">
              {impactMetrics.industryCollaborations || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-gov-text-muted mt-1">
              Industry Partnerships
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Structured Chart Suites Navigation Tabs */}
      <div className="flex items-center space-x-1 border-b border-gov-border overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: '1. Submissions & Domains', icon: BarChart3 },
          { id: 'geography', label: '2. Geographical & Monthly Trends', icon: MapPin },
          { id: 'institutions', label: '3. Academic & Corporate Allocations', icon: Building2 },
          { id: 'lifecycle', label: '4. 11-Stage Pipeline & Turnaround', icon: Layers },
          { id: 'impact', label: '5. Community Relief & Beneficiaries', icon: Sparkles }
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xs flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-gov-maroon text-gov-maroon bg-white font-bold'
                  : 'border-transparent text-gov-navy hover:bg-gov-sand-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Submissions & Domains */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Challenges by Category */}
          <Card accent="navy" title="Chart 1: Challenges by Societal Category">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.challengesByCategory || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Bar dataKey="count" name="Submissions" fill="#142a45" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Challenges by Status */}
          <Card accent="maroon" title="Chart 3: Challenges by Status Distribution">
            <div className="h-72 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.challengesByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {(charts.challengesByStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || DELHI_PALETTE[index % DELHI_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Geographical & Monthly Trends */}
      {activeTab === 'geography' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 2: Challenges by District */}
          <Card accent="gold" title="Chart 2: Challenges Across 11 Delhi Districts">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={charts.challengesByDistrict || []}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="district" tick={{ fontSize: 10, fill: '#4b5563' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Bar dataKey="count" name="Reported Problems" fill="#b8860b" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Monthly Challenge Submissions Timeline */}
          <Card accent="emerald" title="Chart 4: Monthly Submissions Velocity">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlySubmissions || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="submissionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#4b5563' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Area type="monotone" dataKey="count" name="Submissions" stroke="#059669" fillOpacity={1} fill="url(#submissionGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Institutional Ecosystem */}
      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 5: University Participation */}
          <Card accent="navy" title="Chart 5: University Cohort Participation">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.universityParticipation || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="university" tick={{ fontSize: 10, fill: '#4b5563' }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Bar dataKey="projects" name="Assigned Innovation Projects" fill="#142a45" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 6: Industry Participation */}
          <Card accent="purple" title="Chart 6: Industry Collaboration Support Modalities">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.industryParticipation || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="supportType" tick={{ fontSize: 10, fill: '#4b5563' }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Bar dataKey="count" name="Corporate Pledges" fill="#7a1f2d" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: 11-Stage Pipeline & Velocity */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          {/* Chart 8: Projects by Lifecycle Stage (11 Stages) */}
          <Card accent="maroon" title="Chart 8: Innovation Projects Across the 11-Stage Pipeline">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.projectsByLifecycleStage || []} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#4b5563' }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                  />
                  <Bar dataKey="count" name="Projects" fill="#7a1f2d" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 7: Project Completion Rate */}
            <Card accent="emerald" title="Chart 7: Project Completion Velocity">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.projectCompletionRate?.breakdown || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                    >
                      {(charts.projectCompletionRate?.breakdown || []).map((entry, idx) => (
                        <Cell key={`comp-${idx}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 9: Average Turnaround Time */}
            <Card accent="gold" title="Chart 9: Average State Stage Turnaround (Days)">
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.averageResolutionTime || []} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#4b5563' }} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 9, fill: '#4b5563' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }} />
                    <Bar dataKey="avgDays" name="Avg Turnaround Days" fill="#b8860b" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 5: Community Impact */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {/* Chart 10: Community Impact */}
          <Card accent="emerald" title="Chart 10: Verified Civic Relief (Citizens Benefited by Sector)">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.communityImpact || []} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#4b5563' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#4b5563' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', fontSize: '11px', fontFamily: 'serif' }}
                    formatter={(value) => [`${Number(value).toLocaleString('en-IN')} Citizens`, 'Beneficiaries']}
                  />
                  <Bar dataKey="citizensBenefited" name="Citizens Benefited" fill="#059669" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
