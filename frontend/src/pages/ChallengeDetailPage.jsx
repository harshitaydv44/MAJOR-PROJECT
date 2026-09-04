import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import Timeline from '../components/common/Timeline';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Building,
  User,
  Paperclip,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await problemService.getProblemById(id);
      setProblem(res.data?.problem);
    } catch (err) {
      console.error('Failed to load challenge detail:', err);
      setError(err.message || 'Challenge not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading challenge details and lifecycle progress..." />;
  }

  if (error || !problem) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center font-serif">
        <ErrorState
          title="Challenge Record Unavailable"
          message={error || 'Challenge not found or your account does not have authorization to view it.'}
          onRetry={fetchDetail}
          retryLabel="Retry Loading Challenge"
        />
        <div className="mt-4">
          <Link to="/client/challenges">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Return to My Challenges
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/client/challenges"
          className="inline-flex items-center text-xs font-serif text-gov-maroon hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to My Challenges
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-serif text-gov-text-muted">Challenge ID:</span>
          <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-maroon-surface px-2 py-0.5 rounded-xs border border-gov-maroon-border">
            {problem.code || `DEL-${problem._id.slice(-4).toUpperCase()}`}
          </span>
        </div>
      </div>

      {/* Main Challenge Header Card */}
      <Card accent="maroon">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gov-border pb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-serif bg-gov-navy text-white rounded-xs font-semibold">
                {problem.category}
              </span>
              <span className="text-xs font-serif text-gov-text-muted">
                Priority: <strong className="capitalize">{problem.priority || 'Medium'}</strong>
              </span>
            </div>

            <StatusBadge status={problem.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-tight">
            {problem.title}
          </h1>

          {/* Quick Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-serif text-gov-text-muted pt-1">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
              Submitted on {formatDate(problem.createdAt)}
            </span>

            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gov-maroon" />
              {problem.district} {problem.location?.area ? `• ${problem.location.area}` : ''}
            </span>

            {problem.location?.landmark && (
              <span className="flex items-center">
                <strong>Landmark:</strong>&nbsp;{problem.location.landmark}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 2-Column Grid: Left (Description & Timeline) | Right (Assigned Institution & Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Problem Statement */}
          <Card title="Detailed Problem Description & Ground Impact" accent="none">
            <p className="text-xs sm:text-sm font-serif text-gov-text-secondary leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>

            {problem.tags && problem.tags.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gov-border flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-serif font-bold text-gov-navy mr-1">Tags:</span>
                {problem.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gov-sand-100 text-gov-text-secondary rounded-xs text-[11px] font-serif border border-gov-border"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Visual Lifecycle Timeline */}
          <Card
            accent="maroon"
            title="Challenge Progress & Verification Lifecycle"
            subtitle="Track government screening, university cohort assignment, and field validation stages"
          >
            <Timeline currentStatus={problem.status} events={problem.timeline || []} />
          </Card>

          {/* Latest Updates & Notes */}
          <Card title="Latest Updates & University Field Notes" accent="none">
            {problem.solutionNotes ? (
              <div className="p-4 bg-gov-sand-50 border border-gov-border rounded-xs text-xs font-serif space-y-2">
                <div className="font-bold text-gov-navy flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Cohort Progress Note
                </div>
                <p className="text-gov-text-secondary leading-relaxed">
                  {problem.solutionNotes}
                </p>
              </div>
            ) : (
              <div className="text-xs font-serif text-gov-text-muted py-3">
                No formal field notes posted yet. Once verified and assigned to a research faculty, technical status reports will appear here.
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: Institution & Evidence */}
        <div className="space-y-6">
          {/* Active Project Lifecycle Link */}
          {problem.assignedProject && (
            <Card title="Active Municipal Engineering Project" accent="maroon">
              <div className="space-y-2.5 text-xs font-serif">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-gov-navy text-sm leading-snug">
                    {problem.assignedProject.title}
                  </h4>
                  <Badge variant="navy">{problem.assignedProject.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gov-text-muted">
                  <span>Timeline: {problem.assignedProject.timeline || '6 Months'}</span>
                  <span className="font-bold text-gov-maroon">{problem.assignedProject.overallProgress || 0}% Complete</span>
                </div>
                <div className="pt-2 border-t border-gov-border">
                  <Link to={`/projects/${problem.assignedProject._id}`}>
                    <Button variant="primary" size="sm" fullWidth className="bg-gov-maroon text-white">
                      Open Project Workspace &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Assigned Institution Card */}
          <Card title="Assigned Academic Institution" accent="navy">
            {problem.assignedUniversity ? (
              <div className="space-y-3 text-xs font-serif">
                <div className="flex items-start space-x-2.5">
                  <Building className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gov-navy">
                      {problem.assignedUniversity.name || 'University Research Lab'}
                    </div>
                    <div className="text-gov-text-muted text-[11px]">
                      {problem.assignedUniversity.organization || 'Accredited Delhi Higher Education Institution'}
                    </div>
                  </div>
                </div>

                {problem.facultyLead?.name && (
                  <div className="pt-2 border-t border-gov-border flex items-start space-x-2.5">
                    <User className="w-4 h-4 text-gov-maroon flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gov-navy">Faculty Mentor:</span>
                      <div className="text-gov-text-secondary">
                        {problem.facultyLead.name} ({problem.facultyLead.department || 'Engineering'})
                      </div>
                    </div>
                  </div>
                )}

                {problem.industryPartner && (
                  <div className="pt-2 border-t border-gov-border text-[11px]">
                    <span className="font-bold text-gov-navy">Corporate Sponsor:</span>
                    <div className="text-emerald-700 font-semibold">
                      {problem.industryPartner.name || 'Industry Partner'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs font-serif text-gov-text-muted leading-relaxed">
                Pending allocation. After administrative vetting, the Delhi State Innovation Council will assign a multidisciplinary faculty cohort.
              </div>
            )}
          </Card>

          {/* Submitted Evidence & Attachments */}
          <Card title="Submitted Evidence & Documents" accent="none">
            {problem.evidence && problem.evidence.length > 0 ? (
              <ul className="divide-y divide-gov-border text-xs font-serif">
                {problem.evidence.map((ev, idx) => (
                  <li key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate mr-2">
                      <Paperclip className="w-3.5 h-3.5 text-gov-maroon flex-shrink-0" />
                      <span className="text-gov-navy font-medium truncate">{ev.title}</span>
                    </div>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gov-maroon hover:underline flex items-center text-[11px] font-bold flex-shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs font-serif text-gov-text-muted py-2">
                No external document attachments provided with this report.
              </div>
            )}
          </Card>

          {/* Citizen Verification Seal */}
          <div className="bg-gov-sand-100 border border-gov-border rounded-sm p-4 text-xs font-serif text-gov-text-secondary flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gov-navy">Authenticated Citizen Record</span>
              <p className="text-[11px] text-gov-text-muted mt-0.5">
                Lodged under GNCTD Public Innovation Framework. Trackable through official grievance reference number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailPage;
