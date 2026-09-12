import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import ProjectCard from '../../components/student/ProjectCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import {
  Briefcase,
  Search,
  Compass,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  FolderOpen
} from 'lucide-react';

const FILTER_TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'active', label: 'Active' },
  { id: 'pending_approval', label: 'Pending Approval' },
  { id: 'research', label: 'Research' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'testing', label: 'Testing' },
  { id: 'pilot', label: 'Pilot' },
  { id: 'completed', label: 'Completed' }
];

const StudentProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [initializing, setInitializing] = useState(false);

  const handleInitProject = async () => {
    setInitializing(true);
    setError(null);
    try {
      await projectService.initStudentProject();
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize project workspace');
    } finally {
      setInitializing(false);
    }
  };

  // Debounce search input to minimize unnecessary network traffic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeFilter !== 'all') {
        params.filter = activeFilter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await projectService.getStudentProjects(params);
      const projectList = res.data?.projects || res.projects || [];
      setProjects(projectList);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to retrieve innovation projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeFilter, debouncedSearch]);

  const handleClearFilters = () => {
    setActiveFilter('all');
    setSearchTerm('');
  };

  if (loading && projects.length === 0 && !searchTerm) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <LoadingState message="Loading your multidisciplinary innovation projects..." />
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ErrorState
          title="Project Workspace Retrieval Notice"
          message={error}
          onRetry={fetchProjects}
          retryLabel="Retry Loading Projects"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-gov-navy">My Projects</h1>
            <span className="text-xs font-serif font-semibold text-gov-maroon px-2 py-0.5 bg-gov-maroon/10 border border-gov-maroon/20 rounded-full">
              {projects.length} Project{projects.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-serif text-gov-text-secondary mt-1">
            Track and collaborate on multidisciplinary engineering prototypes solving Delhi civic challenges.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {projects.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={handleInitProject}
              loading={initializing}
              className="bg-gov-maroon text-white"
            >
              Initialize Project Workspace
            </Button>
          )}
          <Link to="/student/challenges">
            <Button variant="outline" size="sm" icon={Compass}>
              Explore Challenges
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gov-border rounded-sm p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gov-text-muted" />
            <input
              type="text"
              placeholder="Search by project name or linked challenge code/title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon bg-gov-sand-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-serif text-gov-text-muted hover:text-gov-navy"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-t border-gov-border/60 pt-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-serif font-semibold whitespace-nowrap rounded-xs transition-colors ${
                activeFilter === tab.id
                  ? 'bg-gov-maroon text-white shadow-xs'
                  : 'bg-gov-sand-50 text-gov-text-secondary border border-gov-border hover:bg-gov-sand-100 hover:text-gov-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gov-border rounded-sm p-8 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-gov-sand-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-gov-border">
            <FolderOpen className="w-7 h-7 text-gov-maroon" />
          </div>

          <h2 className="text-base font-serif font-bold text-gov-navy">
            {searchTerm || activeFilter !== 'all'
              ? 'No Matching Projects Found'
              : 'You have not joined any innovation project yet.'}
          </h2>

          <p className="text-xs font-serif text-gov-text-muted mt-2 max-w-md mx-auto leading-relaxed">
            {searchTerm || activeFilter !== 'all'
              ? 'No projects in your roster match the current filter and search criteria. Try adjusting your parameters or resetting filters.'
              : 'Form or join a multidisciplinary university team, or express interest in open civic challenges to get assigned to a field innovation initiative.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {searchTerm || activeFilter !== 'all' ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Reset All Filters
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={handleInitProject}
                  loading={initializing}
                  className="bg-gov-maroon text-white"
                >
                  {initializing ? 'Provisioning Project...' : 'Initialize Innovation Project'}
                </Button>
                <Link to="/student/challenges">
                  <Button variant="outline" size="sm" icon={Compass}>
                    Explore Challenges
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProjectsPage;
