import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import SubmitDeliverableModal from '../../components/student/SubmitDeliverableModal';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Upload,
  Send,
  Calendar,
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Shield,
  Save,
  RotateCcw,
  Briefcase,
  User,
  GraduationCap
} from 'lucide-react';

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', variant: 'sand', color: 'bg-gray-100 text-gray-800' },
  IN_PROGRESS: { label: 'In Progress', variant: 'navy', color: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'gold', color: 'bg-amber-100 text-amber-900' },
  COMPLETED: { label: 'Completed', variant: 'maroon', color: 'bg-emerald-100 text-emerald-800' },
  DELAYED: { label: 'Delayed', variant: 'sand', color: 'bg-rose-100 text-rose-800' }
};

const FILTER_TABS = [
  { id: 'all', label: 'All Milestones' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'completed', label: 'Completed' },
  { id: 'revision_required', label: 'Revision Required' },
  { id: 'delayed', label: 'Delayed' }
];

const StudentMilestonesPage = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Deliverable modal state
  const [selectedMilestoneForUpload, setSelectedMilestoneForUpload] = useState(null);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);

  // Progress edit states: { [milestoneId]: progressValue }
  const [progressEdits, setProgressEdits] = useState({});
  const [savingProgressId, setSavingProgressId] = useState(null);
  const [submittingReviewId, setSubmittingReviewId] = useState(null);

  const fetchMilestones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getStudentMilestones();
      const list = res.data?.milestones || res.milestones || [];
      setMilestones(list);

      // Initialize progress edits
      const initialEdits = {};
      list.forEach((m) => {
        initialEdits[m._id] = m.progress || 0;
      });
      setProgressEdits(initialEdits);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load project milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleProgressSliderChange = (milestoneId, value) => {
    const val = Number(value);
    // Student clamp: maximum allowed progress is 99%
    const clampedVal = Math.min(val, 99);
    setProgressEdits((prev) => ({
      ...prev,
      [milestoneId]: clampedVal
    }));
  };

  const handleSaveProgress = async (milestoneId) => {
    const newProgress = progressEdits[milestoneId];
    if (newProgress === undefined) return;

    setSavingProgressId(milestoneId);
    setActionError('');
    try {
      await projectService.updateStudentMilestoneProgress(milestoneId, {
        progress: newProgress
      });
      setActionSuccess('Milestone progress saved successfully!');
      fetchMilestones();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to save progress');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setSavingProgressId(null);
    }
  };

  const handleSubmitForReview = async (milestoneId) => {
    setSubmittingReviewId(milestoneId);
    setActionError('');
    try {
      await projectService.submitStudentMilestoneReview(milestoneId, {
        note: 'Submitted for formal faculty mentor evaluation and sprint verification.'
      });
      setActionSuccess('Milestone submitted for faculty mentor evaluation!');
      fetchMilestones();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to submit milestone for review');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const openDeliverableModal = (milestone) => {
    setSelectedMilestoneForUpload(milestone);
    setIsDeliverableModalOpen(true);
  };

  const handleDeliverableSuccess = () => {
    setActionSuccess('Deliverable successfully uploaded and attached to milestone!');
    fetchMilestones();
    setTimeout(() => setActionSuccess(''), 5000);
  };

  // Filtered milestones
  const filteredMilestones = milestones.filter((m) => {
    // Filter Tab
    if (activeFilter === 'in_progress' && m.status !== 'IN_PROGRESS') return false;
    if (activeFilter === 'under_review' && m.status !== 'UNDER_REVIEW') return false;
    if (activeFilter === 'completed' && m.status !== 'COMPLETED') return false;
    if (activeFilter === 'delayed' && m.status !== 'DELAYED') return false;
    if (activeFilter === 'revision_required' && !m.isRevisionRequired) return false;

    // Search Term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchProject = m.projectTitle?.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      return matchTitle || matchProject || matchDesc;
    }

    return true;
  });

  // Stats calculation
  const totalCount = milestones.length;
  const inProgressCount = milestones.filter((m) => m.status === 'IN_PROGRESS').length;
  const underReviewCount = milestones.filter((m) => m.status === 'UNDER_REVIEW').length;
  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;
  const revisionCount = milestones.filter((m) => m.isRevisionRequired).length;

  if (loading && milestones.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-serif">
        <LoadingState message="Loading your multidisciplinary innovation sprint milestones..." />
      </div>
    );
  }

  if (error && milestones.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-serif">
        <ErrorState
          title="Milestone Registry Access Notice"
          message={error}
          onRetry={fetchMilestones}
          retryLabel="Retry Loading Milestones"
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-serif space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-gov-navy">Project Milestones & Deliverables</h1>
            <span className="text-xs font-semibold text-gov-maroon px-2 py-0.5 bg-gov-maroon/10 border border-gov-maroon/20 rounded-full">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gov-text-secondary mt-1">
            Track sprint milestones, attach engineering deliverables, and receive faculty review sign-offs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => openDeliverableModal(null)}
            className="bg-gov-maroon text-white"
          >
            Submit Deliverable
          </Button>
          <Link to="/student/projects">
            <Button variant="outline" size="sm" icon={Briefcase}>
              View Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-900 flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-900 flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-gov-border rounded-sm shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Milestones</span>
          <div className="text-xl font-bold text-gov-navy mt-1">{totalCount}</div>
        </div>

        <div className="p-3 bg-white border border-gov-border rounded-sm shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-700 block">In Progress</span>
          <div className="text-xl font-bold text-blue-900 mt-1">{inProgressCount}</div>
        </div>

        <div className="p-3 bg-white border border-gov-border rounded-sm shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 block">Under Review</span>
          <div className="text-xl font-bold text-amber-900 mt-1">{underReviewCount}</div>
        </div>

        <div className="p-3 bg-white border border-gov-border rounded-sm shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Completed</span>
          <div className="text-xl font-bold text-emerald-900 mt-1">{completedCount}</div>
        </div>

        <div className="p-3 bg-white border border-gov-border rounded-sm shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">Revision Req.</span>
          <div className="text-xl font-bold text-rose-900 mt-1">{revisionCount}</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white border border-gov-border rounded-sm p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gov-text-muted" />
          <input
            type="text"
            placeholder="Search milestones by title, project, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gov-border rounded-xs bg-gov-sand-50/50 outline-none focus:border-gov-maroon"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gov-text-muted hover:text-gov-navy"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-t border-gov-border/60 pt-3">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded-xs transition-colors ${
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

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <Card accent="none" className="py-16 text-center text-xs text-gov-text-muted space-y-3">
          <Layers className="w-10 h-10 text-gov-maroon mx-auto opacity-70" />
          <div>
            <p className="font-bold text-gov-navy text-sm">No Milestones Found</p>
            <p className="max-w-md mx-auto mt-1">
              {searchTerm || activeFilter !== 'all'
                ? 'No project milestones match your filter or search query. Try clearing filters.'
                : 'No milestones are currently assigned to your projects.'}
            </p>
          </div>
          {(searchTerm || activeFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilter('all');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMilestones.map((ms) => {
            const statusStyle = STATUS_CONFIG[ms.status] || STATUS_CONFIG.NOT_STARTED;
            const currentProgress = progressEdits[ms._id] !== undefined ? progressEdits[ms._id] : ms.progress;
            const isModified = currentProgress !== ms.progress;
            const isCompleted = ms.status === 'COMPLETED';
            const isUnderReview = ms.status === 'UNDER_REVIEW';
            const isRevision = ms.isRevisionRequired;

            return (
              <div
                key={ms._id}
                className={`bg-white border rounded-sm p-5 shadow-xs transition-shadow space-y-4 ${
                  isRevision
                    ? 'border-rose-300 ring-1 ring-rose-300'
                    : isUnderReview
                    ? 'border-amber-300'
                    : isCompleted
                    ? 'border-emerald-300'
                    : 'border-gov-border hover:shadow-md'
                }`}
              >
                {/* Milestone Top Row: Project info + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${ms.projectId}`}
                        className="text-xs font-bold text-gov-maroon hover:underline flex items-center space-x-1"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{ms.projectTitle}</span>
                      </Link>
                      <span className="text-[10px] bg-gov-sand-50 border border-gov-border px-1.5 py-0.2 rounded-xs font-mono text-gray-500">
                        {ms.projectCode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gov-navy">{ms.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-xs text-[11px] font-bold ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                    {isRevision && (
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                        Revision required
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {ms.description && (
                  <p className="text-xs text-gov-text-secondary leading-relaxed bg-gov-sand-50/40 p-3 border border-gov-border rounded-xs">
                    {ms.description}
                  </p>
                )}

                {/* Revision Required Alert Banner */}
                {isRevision && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-rose-900 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Revision Required by Supervising Faculty Mentor</span>
                    </div>
                    {ms.facultyFeedback && (
                      <p className="text-rose-950 bg-white p-2.5 border border-rose-200 rounded-xs text-[11px]">
                        <strong>Feedback:</strong> {ms.facultyFeedback}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-rose-700">
                        Updated deliverables can be attached and resubmitted below.
                      </span>
                      <Button
                        variant="primary"
                        size="xs"
                        icon={RotateCcw}
                        onClick={() => openDeliverableModal(ms)}
                        className="bg-rose-700 hover:bg-rose-800 text-white"
                      >
                        Resubmit Deliverables
                      </Button>
                    </div>
                  </div>
                )}

                {/* Faculty Feedback Section (Normal Review) */}
                {ms.facultyFeedback && !isRevision && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xs text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-900 flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                        <span>Faculty Mentor Feedback ({ms.facultyReviewerName})</span>
                      </span>
                      {ms.facultyFeedbackDate && (
                        <span className="text-gray-500 text-[10px]">
                          {new Date(ms.facultyFeedbackDate).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-950 leading-relaxed bg-white p-2.5 border border-blue-100 rounded-xs">
                      {ms.facultyFeedback}
                    </p>
                  </div>
                )}

                {/* Grid: Schedule & Deliverables Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Schedule Details */}
                  <div className="space-y-2 p-3 bg-gov-sand-50/50 border border-gov-border rounded-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Sprint Schedule & Supervision
                    </span>
                    <div className="space-y-1 text-[11px] text-gov-text-secondary">
                      <div className="flex items-center justify-between">
                        <span>Due Date:</span>
                        <strong className="text-gov-navy">
                          {ms.dueDate ? new Date(ms.dueDate).toLocaleDateString('en-IN') : 'TBD'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Faculty Supervisor:</span>
                        <strong className="text-gov-navy">{ms.facultyMentor?.name}</strong>
                      </div>
                      {ms.submissionNote && (
                        <div className="pt-1 border-t border-gov-border">
                          <span className="text-[10px] text-gray-400 block">Latest Submission Note:</span>
                          <span className="text-gray-700 italic">{ms.submissionNote}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Required Deliverables Checklist */}
                  <div className="space-y-2 p-3 bg-gov-sand-50/50 border border-gov-border rounded-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Required Deliverables Checklist
                    </span>
                    {ms.requiredDeliverables && ms.requiredDeliverables.length > 0 ? (
                      <ul className="space-y-1 text-[11px]">
                        {ms.requiredDeliverables.map((item, dIdx) => (
                          <li key={dIdx} className="flex items-start space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gov-text-secondary">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 italic text-[11px]">
                        Standard sprint artifacts (schematics, code, test reports).
                      </p>
                    )}
                  </div>
                </div>

                {/* Submitted Documents / Artifacts Vault */}
                {ms.documents && ms.documents.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Attached Deliverable Documents ({ms.documents.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {ms.documents.map((doc, docIdx) => (
                        <div
                          key={docIdx}
                          className="p-2.5 bg-white border border-gov-border rounded-xs flex items-center justify-between text-left space-x-2"
                        >
                          <div className="truncate space-y-0.5">
                            <div className="font-semibold text-gov-navy truncate text-xs">{doc.title}</div>
                            {doc.description && (
                              <p className="text-[10px] text-gray-500 truncate">{doc.description}</p>
                            )}
                            <div className="text-[9px] text-gray-400">
                              Vaulted: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN') : 'Recently'}
                            </div>
                          </div>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-gov-maroon hover:bg-gov-sand-100 rounded-xs flex-shrink-0"
                              title="Download / View Artifact"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Progress Slider */}
                <div className="space-y-2 pt-2 border-t border-gov-border">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gov-navy">Sprint Progress:</span>
                      <span className="font-mono font-bold text-gov-maroon text-sm">{currentProgress}%</span>
                      {isModified && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-xs">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gov-text-muted">
                      {isCompleted
                        ? '100% Milestone Approved by Faculty Mentor'
                        : 'Student maximum: 99% (Mentor sign-off required for 100%)'}
                    </span>
                  </div>

                  {!isCompleted && (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="99"
                        value={currentProgress}
                        disabled={isCompleted || savingProgressId === ms._id}
                        onChange={(e) => handleProgressSliderChange(ms._id, e.target.value)}
                        className="w-full accent-gov-maroon cursor-pointer h-1.5 bg-gov-sand-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>0% (Initiated)</span>
                        <span>50% (Prototyping)</span>
                        <span>99% (Deliverables Ready)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gov-border">
                  <div className="flex items-center space-x-1.5 text-[11px] text-gray-500">
                    <Shield className="w-3.5 h-3.5 text-gov-maroon" />
                    <span>Student Innovation Protocol</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Submit Deliverable Button */}
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Upload}
                      onClick={() => openDeliverableModal(ms)}
                    >
                      Attach Deliverable
                    </Button>

                    {/* Save Progress Button */}
                    {isModified && (
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={Save}
                        loading={savingProgressId === ms._id}
                        onClick={() => handleSaveProgress(ms._id)}
                      >
                        Save Progress ({currentProgress}%)
                      </Button>
                    )}

                    {/* Submit for Review Button */}
                    {!isCompleted && (
                      <Button
                        variant="primary"
                        size="xs"
                        icon={Send}
                        disabled={isUnderReview || submittingReviewId === ms._id}
                        loading={submittingReviewId === ms._id}
                        onClick={() => handleSubmitForReview(ms._id)}
                        className={isUnderReview ? 'bg-amber-600 text-white' : 'bg-gov-maroon text-white'}
                      >
                        {isUnderReview ? 'Under Mentor Review' : 'Submit for Faculty Review'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deliverable Modal */}
      <SubmitDeliverableModal
        milestone={selectedMilestoneForUpload}
        milestones={milestones}
        isOpen={isDeliverableModalOpen}
        onClose={() => {
          setIsDeliverableModalOpen(false);
          setSelectedMilestoneForUpload(null);
        }}
        onSuccess={handleDeliverableSuccess}
      />
    </div>
  );
};

export default StudentMilestonesPage;
