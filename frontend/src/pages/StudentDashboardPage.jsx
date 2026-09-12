import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { studentService } from '../services/studentService';
import StudentWelcome from '../components/student/StudentWelcome';
import StudentStats from '../components/student/StudentStats';
import StudentActiveProject from '../components/student/StudentActiveProject';
import ProjectLifecycle from '../components/student/ProjectLifecycle';
import UpcomingMilestones from '../components/student/UpcomingMilestones';
import RecentActivity from '../components/student/RecentActivity';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading your student dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Dashboard Load Failed"
          message={error}
          onRetry={fetchDashboardData}
          retryLabel="Retry Loading Dashboard"
        />
      </div>
    );
  }

  const activeProject = dashboardData?.activeProjects?.[0] || null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <StudentWelcome student={dashboardData?.student} />

      {/* Statistics */}
      <StudentStats stats={dashboardData?.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Project + Lifecycle */}
        <div className="lg:col-span-2 space-y-6">
          <StudentActiveProject project={activeProject} />
          {activeProject && (
            <ProjectLifecycle currentStage={activeProject.status} />
          )}
        </div>

        {/* Right Column: Milestones + Activity */}
        <div className="space-y-6">
          <UpcomingMilestones milestones={dashboardData?.upcomingMilestones || []} />
          <RecentActivity activities={dashboardData?.recentActivity || []} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
