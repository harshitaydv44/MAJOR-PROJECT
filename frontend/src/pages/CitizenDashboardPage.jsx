import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardCard from '../components/common/DashboardCard';
import ChallengeTable from '../components/common/ChallengeTable';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { clientService } from '../services/clientService';
import { problemService } from '../services/problemService';
import { useAuth } from '../hooks/useAuth';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  HelpCircle,
  Bookmark
} from 'lucide-react';

const CitizenDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Call primary client dashboard endpoint
      const dashRes = await clientService.getDashboard();
      const dashData = dashRes?.data || {};

      setStats({
        total: dashData.totalChallenges ?? 0,
        underReview: dashData.underReview ?? 0,
        inProgress: dashData.inProgress ?? 0,
        resolved: dashData.resolved ?? 0,
        submitted: dashData.submitted ?? 0,
        needsInfo: dashData.needsInfo ?? 0,
        savedChallenges: dashData.savedChallenges ?? 0
      });

      if (dashData.recentChallenges && dashData.recentChallenges.length > 0) {
        setProblems(dashData.recentChallenges);
      } else {
        // Fallback: fetch problems list
        const probRes = await problemService.getMyProblems({ limit: 5 });
        setProblems(probRes?.data?.problems || []);
      }
    } catch (err) {
      console.error('Failed to load citizen dashboard data:', err);
      // Secondary fallback
      try {
        const fallbackRes = await problemService.getMyProblems({ limit: 5 });
        const { stats: fetchedStats, problems: fetchedProblems } = fallbackRes?.data || {};
        setStats(fetchedStats || { total: 0, underReview: 0, inProgress: 0, resolved: 0, needsInfo: 0 });
        setProblems(fetchedProblems || []);
      } catch (fallbackErr) {
        setError(err.message || 'Failed to fetch dashboard data. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your submitted challenges and statistics from Delhi State Registry..." />;
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Citizen Console"
          message={error}
          onRetry={loadDashboardData}
          retryLabel="Retry Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 shadow-gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif text-gov-maroon font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Welcome, {user?.name || 'Citizen'}</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-gov-navy leading-tight">
            Citizen Problem Monitoring Console
          </h1>
          <p className="text-xs font-serif text-gov-text-secondary mt-1 max-w-2xl">
            Track community grievances, monitor university research progress, and observe municipal field deployments across Delhi's 11 districts.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <Button variant="subtle" size="sm" onClick={loadDashboardData} icon={RefreshCw}>
            Refresh
          </Button>
          <Link to="/client/submit">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Submit a Challenge
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Banner if admin requested information */}
      {stats?.needsInfo > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-sm flex items-center justify-between font-serif text-xs">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Administrative Action Required:</span>{' '}
              District authorities have requested supplementary evidence or clarification on {stats.needsInfo} challenge{stats.needsInfo > 1 ? 's' : ''}.
            </div>
          </div>
          <Link to="/client/challenges?status=NEEDS_INFORMATION" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="border-amber-400 text-amber-900 hover:bg-amber-100">
              Review Requests &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Challenges Submitted"
          value={stats?.total || 0}
          subtitle="Total community problems lodged"
          icon={FileText}
          accent="maroon"
          onClick={() => navigate('/client/challenges')}
        />

        <DashboardCard
          title="Under Review"
          value={stats?.underReview || 0}
          subtitle="Pending district nodal screening"
          icon={Clock}
          accent="amber"
          onClick={() => navigate('/client/challenges?status=UNDER_REVIEW')}
        />

        <DashboardCard
          title="In Progress"
          value={stats?.inProgress || 0}
          subtitle="Active university prototyping"
          icon={TrendingUp}
          accent="navy"
          onClick={() => navigate('/client/challenges?status=IN_PROGRESS')}
        />

        <DashboardCard
          title="Resolved"
          value={stats?.resolved || 0}
          subtitle="Certified municipal solutions"
          icon={CheckCircle2}
          accent="emerald"
          onClick={() => navigate('/client/challenges?status=RESOLVED')}
        />
      </div>

      {/* Recent Challenges Section */}
      <Card
        accent="maroon"
        title="Recent Challenges"
        subtitle="Your latest submitted societal statements and active lifecycle status"
        headerAction={
          <div className="flex items-center space-x-2">
            <Link to="/client/saved">
              <Button variant="subtle" size="sm" icon={Bookmark}>
                Saved ({stats?.savedChallenges || 0})
              </Button>
            </Link>
            <Link to="/client/challenges">
              <Button variant="subtle" size="sm" icon={ArrowRight}>
                View All ({stats?.total || problems.length})
              </Button>
            </Link>
          </div>
        }
      >
        <ChallengeTable
          challenges={problems}
          onViewDetails={(id) => navigate(`/client/challenges/${id}`)}
          emptyMessage="You have not submitted any challenges yet. Use 'Submit a Challenge' to lodge your first community problem."
        />
      </Card>

      {/* Civic Guidelines Banner */}
      <div className="bg-gov-sand-100 border border-gov-border rounded-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-serif">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-gov-maroon flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gov-navy">Delhi Civic Innovation Framework</span>
            <p className="text-gov-text-secondary mt-0.5">
              Verified problem statements in water, sanitation, and air quality are paired with research labs at DTU, NSUT, and IIIT-Delhi for funded pilot prototypes.
            </p>
          </div>
        </div>

        <Link to="/client/help" className="flex-shrink-0">
          <Button variant="outline" size="sm">
            Read Reporting Standards
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CitizenDashboardPage;
