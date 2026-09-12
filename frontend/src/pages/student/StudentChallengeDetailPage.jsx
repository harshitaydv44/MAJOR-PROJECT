import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengeService } from '../../services/challengeService';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import {
  MapPin,
  AlertCircle,
  Calendar,
  Building2,
  User,
  FileText,
  Image as ImageIcon,
  Video,
  Target,
  ArrowLeft,
  Heart,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  Compass,
  Clock,
  X,
  Award,
  BookOpen
} from 'lucide-react';

const StudentChallengeDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [interestStatus, setInterestStatus] = useState(null);

  // Express Interest Modal State
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [interestNotes, setInterestNotes] = useState('');
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestFeedback, setInterestFeedback] = useState(null);

  const fetchChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await challengeService.getChallengeById(id);
      const challengeData = res.data?.challenge || res.challenge || null;
      const projectsData = res.data?.relatedProjects || res.relatedProjects || [];
      setChallenge(challengeData);
      setRelatedProjects(projectsData);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  };

  const fetchInterestStatus = async () => {
    try {
      const res = await challengeService.getInterestStatus(id);
      const statusData = res.data || res;
      setInterestStatus(statusData);
    } catch (err) {
      // Interest record may not exist yet; gracefully ignore
      setInterestStatus(null);
    }
  };

  useEffect(() => {
    fetchChallenge();
    fetchInterestStatus();
  }, [id]);

  const handleOpenInterestModal = () => {
    setInterestNotes('');
    setInterestFeedback(null);
    setIsInterestModalOpen(true);
  };

  const handleCloseInterestModal = () => {
    setIsInterestModalOpen(false);
    setInterestNotes('');
    setInterestFeedback(null);
  };

  const handleSubmitInterest = async (e) => {
    e.preventDefault();
    setInterestSubmitting(true);
    setInterestFeedback(null);

    try {
      await challengeService.expressInterest(id, interestNotes);
      setInterestFeedback({
        type: 'success',
        message: 'Innovation proposal submitted successfully! University coordinators have been notified.'
      });
      await fetchInterestStatus();
      setTimeout(() => {
        handleCloseInterestModal();
      }, 1500);
    } catch (err) {
      setInterestFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Failed to submit expression of interest.'
      });
    } finally {
      setInterestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <LoadingState message="Loading validated municipal challenge details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Challenge Retrieval Notice"
          message={error}
          onRetry={fetchChallenge}
          retryLabel="Retry Loading Challenge"
        />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16 bg-white border border-gov-border rounded-sm p-8 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-gov-maroon mx-auto mb-3" />
          <h2 className="text-base font-serif font-bold text-gov-navy">Challenge Not Found</h2>
          <p className="text-xs font-serif text-gov-text-muted mt-2">
            The requested civic challenge record could not be found or may have been archived.
          </p>
          <div className="mt-6">
            <Link to="/student/challenges">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Return to Challenges
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    code,
    title,
    description,
    category,
    district,
    location,
    priority,
    status,
    createdAt,
    submittedBy,
    assignedUniversity,
    facultyLead,
    evidence,
    tags,
    aiRecommendedExpertise,
    aiSummary,
    impact,
    urgency,
    severity
  } = challenge;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '—';

  // Partition evidence into images, videos, and documents
  const evidenceList = evidence || [];
  const images = evidenceList.filter((item) => {
    const ft = (item.fileType || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    return ft.includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
  });
  const videos = evidenceList.filter((item) => {
    const ft = (item.fileType || '').toLowerCase();
    const url = (item.url || '').toLowerCase();
    return ft.includes('video') || /\.(mp4|webm|mov|mkv)$/i.test(url);
  });
  const documents = evidenceList.filter((item) => {
    const isImg = images.includes(item);
    const isVid = videos.includes(item);
    return !isImg && !isVid;
  });

  // Combine tags and expertise into unique required skills
  const combinedSkills = Array.from(
    new Set([...(tags || []), ...(aiRecommendedExpertise || [])])
  ).filter(Boolean);

  // Interest and eligibility checks
  const isInterestExpressed = interestStatus?.hasExpressedInterest;
  const interestState = interestStatus?.status; // PENDING, ACCEPTED, REJECTED
  const isEligibleToExpress =
    (status === 'VALIDATED' || status === 'ASSIGNED') && !isInterestExpressed;

  // Expected outcome text
  const expectedOutcomeText =
    aiSummary?.expectedOutcome ||
    challenge.solutionNotes ||
    'Develop and field-test an operational technology prototype resolving localized municipal disruptions with measurable performance indicators.';

  // Why it matters text
  const whyItMattersText =
    impact ||
    (aiSummary?.affectedGroup
      ? `Critical municipal bottleneck directly impacting ${aiSummary.affectedGroup} in ${district}. Requires multidisciplinary student engineering for civic resilience.`
      : `High-priority public infrastructure challenge in ${district}. Resolving this issue enhances citizen safety, municipal service levels, and regional quality of life.`);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link to="/student/challenges">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Challenges
          </Button>
        </Link>
        <div className="flex items-center space-x-2 text-[11px] font-serif text-gov-text-muted">
          <span>Delhi Municipal Portal</span>
          <span>&rsaquo;</span>
          <span>Student Innovator</span>
          <span>&rsaquo;</span>
          <span className="text-gov-navy font-semibold">{code || 'Challenge Details'}</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gov-border rounded-sm p-6 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-serif font-bold text-gov-maroon tracking-wider uppercase">
                {code || 'DEL-CHALLENGE'}
              </span>
              <span className="text-gov-border">&bull;</span>
              <Badge variant="navy">{category}</Badge>
              <span className="text-gov-border">&bull;</span>
              <Badge variant="gold">{district}</Badge>
              <span className="text-gov-border">&bull;</span>
              <StatusBadge status={status} />
              <Badge
                variant={
                  priority === 'critical' || priority === 'high' ? 'maroon' : 'neutral'
                }
              >
                {priority?.toUpperCase()} PRIORITY
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gov-navy leading-snug">
              {title}
            </h1>
          </div>

          {/* Action / Interest Status Callout */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            {isEligibleToExpress && (
              <Button
                variant="primary"
                icon={Heart}
                onClick={handleOpenInterestModal}
              >
                Express Interest
              </Button>
            )}

            {isInterestExpressed && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-sm text-xs font-serif text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>
                  Interest Status: <strong className="uppercase">{interestState || 'PENDING'}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Read-Only Regulatory Notice */}
        <div className="mt-4 pt-4 border-t border-gov-border/60 flex items-center justify-between flex-wrap gap-2 text-[11px] font-serif text-gov-text-muted">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gov-maroon" />
            <span>
              Validated Delhi Municipal Challenge Record &bull; Information locked under public-sector data standards. Read-only for student innovators.
            </span>
          </div>
          <div>Submitted on: {formattedDate}</div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Problem, Why It Matters, Evidence, Related Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Statement */}
          <Card accent="gold" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Problem Statement
              </h2>
            </div>
            <div className="text-xs font-serif text-gov-text-secondary leading-relaxed whitespace-pre-line bg-gov-sand-50/50 p-4 border border-gov-border/60 rounded-xs">
              {description}
            </div>
          </Card>

          {/* Why It Matters */}
          <Card accent="maroon" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-gov-maroon" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Why It Matters & Civic Impact
              </h2>
            </div>
            <p className="text-xs font-serif text-gov-text-secondary leading-relaxed mb-4">
              {whyItMattersText}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gov-border">
              <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
                <div className="text-[10px] font-serif text-gov-text-muted uppercase">Urgency</div>
                <div className="text-xs font-serif font-semibold text-gov-navy capitalize">
                  {urgency || 'Standard review'}
                </div>
              </div>
              <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
                <div className="text-[10px] font-serif text-gov-text-muted uppercase">Severity</div>
                <div className="text-xs font-serif font-semibold text-gov-navy capitalize">
                  {severity || 'Moderate'}
                </div>
              </div>
              <div className="p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
                <div className="text-[10px] font-serif text-gov-text-muted uppercase">Citizen Reach</div>
                <div className="text-xs font-serif font-semibold text-gov-navy">
                  {district} Community
                </div>
              </div>
            </div>
          </Card>

          {/* Expected Outcomes */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Expected Innovation Outcomes
              </h2>
            </div>
            <div className="p-4 bg-white border border-gov-border rounded-xs space-y-2">
              <p className="text-xs font-serif text-gov-text-secondary leading-relaxed">
                {expectedOutcomeText}
              </p>
              <div className="text-[11px] font-serif text-gov-text-muted flex items-center space-x-1.5 pt-2 border-t border-gov-border/60">
                <Award className="w-3.5 h-3.5 text-gov-maroon" />
                <span>Field-tested student deliverables qualify for university innovation credits and municipal deployment pilots.</span>
              </div>
            </div>
          </Card>

          {/* Evidence Section: Images, Videos, Documents */}
          <Card accent="none" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gov-border">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gov-navy" />
                <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                  Field Evidence & Documentation
                </h2>
              </div>
              <span className="text-xs font-serif text-gov-text-muted">
                {evidenceList.length} verified item{evidenceList.length === 1 ? '' : 's'}
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="text-center py-8 bg-gov-sand-50/60 border border-gov-border rounded-xs text-xs font-serif text-gov-text-muted">
                No citizen media evidence was attached to this challenge submission.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Images */}
                {images.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <ImageIcon className="w-3.5 h-3.5 text-gov-maroon" />
                      <h3 className="text-xs font-serif font-bold text-gov-navy">
                        Photographic Evidence ({images.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block border border-gov-border rounded-xs overflow-hidden bg-gov-sand-50 hover:border-gov-maroon transition-colors"
                        >
                          <div className="h-28 overflow-hidden bg-stone-100 relative">
                            <img
                              src={item.url}
                              alt={item.title || 'Evidence image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="p-2">
                            <p className="text-[11px] font-serif font-medium text-gov-navy truncate">
                              {item.title || `Evidence #${idx + 1}`}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videos.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Video className="w-3.5 h-3.5 text-gov-maroon" />
                      <h3 className="text-xs font-serif font-bold text-gov-navy">
                        Video Documentation ({videos.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {videos.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gov-border rounded-xs bg-gov-sand-50 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <Video className="w-4 h-4 text-gov-navy shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs font-serif font-semibold text-gov-navy truncate">
                                {item.title || `Field Recording #${idx + 1}`}
                              </p>
                              <span className="text-[10px] font-serif text-gov-text-muted">
                                Video Stream
                              </span>
                            </div>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gov-text-secondary hover:text-gov-maroon border border-gov-border rounded-xs bg-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-3.5 h-3.5 text-gov-maroon" />
                      <h3 className="text-xs font-serif font-bold text-gov-navy">
                        Government & Technical Documents ({documents.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {documents.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gov-border rounded-xs bg-gov-sand-50 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-gov-maroon shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs font-serif font-semibold text-gov-navy truncate">
                                {item.title || `Document #${idx + 1}`}
                              </p>
                              <span className="text-[10px] font-serif text-gov-text-muted uppercase">
                                {item.fileType || 'PDF/Report'}
                              </span>
                            </div>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gov-text-secondary hover:text-gov-maroon border border-gov-border rounded-xs bg-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Related Projects */}
          <Card accent="none" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gov-border">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-gov-navy" />
                <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                  Related Student Projects
                </h2>
              </div>
              <span className="text-xs font-serif text-gov-text-muted">
                {relatedProjects.length} linked initiative{relatedProjects.length === 1 ? '' : 's'}
              </span>
            </div>

            {relatedProjects.length === 0 ? (
              <div className="text-center py-8 bg-gov-sand-50/60 border border-gov-border rounded-xs text-xs font-serif text-gov-text-muted">
                <p>No student innovation projects have linked to this challenge yet.</p>
                <p className="mt-1">
                  Multidisciplinary teams that express interest and receive university cohort assignment will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedProjects.map((project) => (
                  <div
                    key={project._id}
                    className="p-4 border border-gov-border rounded-xs bg-white hover:border-gov-navy/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-serif font-bold text-gov-navy">
                          {project.title}
                        </h4>
                        <div className="text-[11px] font-serif text-gov-text-muted mt-0.5">
                          Cohort Team: <span className="text-gov-navy font-medium">{project.teamId?.name || 'Assigned Student Cohort'}</span>
                        </div>
                      </div>
                      <Badge variant="navy">
                        {project.stage || project.status || 'IN_PROGRESS'}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-serif text-gov-text-muted mb-1">
                        <span>Milestone Progress</span>
                        <span className="font-semibold text-gov-navy">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gov-sand-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gov-maroon h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress || 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1/3 width): Location, Submitted By, Validation Status, University, Required Skills */}
        <div className="space-y-6">
          {/* Location & District */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="w-4 h-4 text-gov-maroon" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Location & Jurisdiction
              </h2>
            </div>
            <div className="space-y-2.5 text-xs font-serif">
              <div className="flex justify-between py-1.5 border-b border-gov-border/60">
                <span className="text-gov-text-muted">District</span>
                <span className="font-semibold text-gov-navy">{district}</span>
              </div>
              {location?.area && (
                <div className="flex justify-between py-1.5 border-b border-gov-border/60">
                  <span className="text-gov-text-muted">Area / Ward</span>
                  <span className="font-medium text-gov-navy">{location.area}</span>
                </div>
              )}
              {location?.landmark && (
                <div className="flex justify-between py-1.5 border-b border-gov-border/60">
                  <span className="text-gov-text-muted">Landmark</span>
                  <span className="font-medium text-gov-navy">{location.landmark}</span>
                </div>
              )}
              {location?.coordinates?.lat && (
                <div className="flex justify-between py-1.5">
                  <span className="text-gov-text-muted">Coordinates</span>
                  <span className="font-mono text-[11px] text-gov-navy">
                    {location.coordinates.lat.toFixed(4)}° N, {location.coordinates.lng.toFixed(4)}° E
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Validation Status & Administration */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Validation Status
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-serif text-gov-text-secondary">Administrative Stage:</span>
                <StatusBadge status={status} />
              </div>
              <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs text-[11px] font-serif text-gov-text-secondary leading-relaxed">
                Audited by Delhi Municipal Nodal Team. All specifications, priorities, and locations are certified.
              </div>
            </div>
          </Card>

          {/* Required Skills */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Compass className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Required Skills & Disciplines
              </h2>
            </div>
            {combinedSkills.length === 0 ? (
              <div className="text-xs font-serif text-gov-text-muted">
                Open to all multidisciplinary engineering & policy specializations.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {combinedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-serif font-medium bg-gov-sand-100 text-gov-navy border border-gov-border rounded-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Assigned University & Faculty */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <Building2 className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Assigned University
              </h2>
            </div>
            {assignedUniversity ? (
              <div className="space-y-2 text-xs font-serif">
                <div>
                  <span className="text-gov-text-muted block text-[10px] uppercase">Institution</span>
                  <span className="font-semibold text-gov-navy">
                    {assignedUniversity.organization || assignedUniversity.name || 'Delhi Technical Campus'}
                  </span>
                </div>
                {facultyLead?.name && (
                  <div className="pt-2 border-t border-gov-border/60">
                    <span className="text-gov-text-muted block text-[10px] uppercase">Faculty Supervisor</span>
                    <span className="font-medium text-gov-navy">{facultyLead.name}</span>
                    {facultyLead.department && (
                      <span className="text-gov-text-muted block text-[11px]">
                        {facultyLead.department}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs font-serif text-gov-text-muted">
                Open for university cohort assignment. Student interest submissions will be evaluated by the departmental screening committee.
              </div>
            )}
          </Card>

          {/* Submitted By */}
          <Card accent="none" className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-4 h-4 text-gov-navy" />
              <h2 className="text-sm font-serif font-bold text-gov-navy uppercase tracking-wider">
                Submitted By
              </h2>
            </div>
            <div className="space-y-2 text-xs font-serif">
              <div>
                <span className="text-gov-text-muted block text-[10px] uppercase">Citizen Contributor</span>
                <span className="font-semibold text-gov-navy">
                  {submittedBy?.name || 'Verified Citizen Contributor'}
                </span>
                {submittedBy?.role && (
                  <span className="text-[10px] font-serif text-gov-text-muted block uppercase">
                    Role: {submittedBy.role}
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-gov-border/60 flex items-center justify-between">
                <span className="text-gov-text-muted">Date Filed:</span>
                <span className="font-medium text-gov-navy">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gov-text-muted">District Registry:</span>
                <span className="font-medium text-gov-navy">{district}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Express Interest Modal Dialog */}
      {isInterestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-gov-border rounded-sm shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-gov-border bg-gov-sand-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-serif font-bold text-gov-maroon uppercase">
                  {code || 'CHALLENGE'}
                </span>
                <h3 className="text-base font-serif font-bold text-gov-navy">
                  Express Student Innovation Interest
                </h3>
              </div>
              <button
                onClick={handleCloseInterestModal}
                className="text-gov-text-muted hover:text-gov-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterest} className="p-6 space-y-4">
              <div className="p-3 bg-gov-sand-100/70 border border-gov-border rounded-sm text-xs font-serif">
                <div className="font-semibold text-gov-navy">{title}</div>
                <div className="text-gov-text-secondary mt-1">
                  District: <span className="font-medium text-gov-navy">{district}</span> &bull; Category:{' '}
                  <span className="font-medium text-gov-navy">{category}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-gov-navy mb-1">
                  Innovation Proposal / Multidisciplinary Pitch Notes
                </label>
                <p className="text-[11px] font-serif text-gov-text-muted mb-2">
                  Outline your team's proposed technological approach, relevant engineering skills, and prototype roadmap.
                </p>
                <textarea
                  rows={4}
                  value={interestNotes}
                  onChange={(e) => setInterestNotes(e.target.value)}
                  placeholder="e.g. Our multidisciplinary student team proposes a field IoT sensor grid and embedded monitoring circuit to alleviate turbidity and supply notifications..."
                  className="w-full p-3 text-xs font-serif border border-gov-border rounded-sm focus:outline-none focus:border-gov-maroon resize-none"
                />
              </div>

              {/* Feedback Alerts */}
              {interestFeedback && (
                <div
                  className={`p-3 rounded-sm text-xs font-serif flex items-center space-x-2 ${
                    interestFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {interestFeedback.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{interestFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gov-border">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleCloseInterestModal}
                  disabled={interestSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={interestSubmitting}
                  icon={Heart}
                >
                  {interestSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChallengeDetailPage;
