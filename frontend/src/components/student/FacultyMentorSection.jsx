import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  GraduationCap,
  MessageSquare,
  Calendar,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Building,
  Award,
  Sparkles,
  Shield,
  X,
  History,
  Info
} from 'lucide-react';

const REVIEW_STATUS_CONFIG = {
  PENDING: { label: 'Pending Initial Review', color: 'bg-stone-100 text-stone-700' },
  REVIEW_REQUESTED: { label: 'Review Requested by Team', color: 'bg-blue-100 text-blue-800 font-bold' },
  IN_REVIEW: { label: 'In Review', color: 'bg-purple-100 text-purple-800 font-bold' },
  SATISFACTORY: { label: 'Satisfactory Progress', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  NEEDS_IMPROVEMENT: { label: 'Action & Revision Required', color: 'bg-amber-100 text-amber-900 font-bold' },
  ACTION_REQUIRED: { label: 'Critical Revision Required', color: 'bg-rose-100 text-rose-800 font-bold' }
};

const FacultyMentorSection = ({ project, user, onProjectUpdate }) => {
  const mentor = project?.mentor;
  const reviews = project?.mentorReviews || [];

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Faculty Feedback Modal (for Faculty/Admin only)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: '',
    reviewStatus: 'SATISFACTORY',
    upcomingReviewDate: ''
  });

  const isStudent = user?.role === 'STUDENT';
  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN' || user?.role === 'UNIVERSITY';

  // 1. Request Review (Student Action)
  const handleRequestReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await projectService.requestMentorReview(project._id, {
        requestNotes: requestNotes.trim()
      });

      setSuccessMsg('Mentorship review requested! Your faculty mentor has been notified.');
      setShowRequestModal(false);
      setRequestNotes('');
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to request mentor review');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Feedback (Faculty Action)
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.feedback.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await projectService.submitMentorFeedback(project._id, {
        feedback: feedbackForm.feedback.trim(),
        reviewStatus: feedbackForm.reviewStatus,
        upcomingReviewDate: feedbackForm.upcomingReviewDate || undefined
      });

      setSuccessMsg('Mentorship evaluation and feedback recorded! Student team notified.');
      setShowFeedbackModal(false);
      setFeedbackForm({ feedback: '', reviewStatus: 'SATISFACTORY', upcomingReviewDate: '' });
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to record mentor feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = REVIEW_STATUS_CONFIG[project?.mentorReviewStatus] || REVIEW_STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6 max-w-4xl font-serif">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-gov-border rounded-xs shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-gov-maroon" />
            <h3 className="text-base font-bold text-gov-navy">
              Supervising Faculty Mentor
            </h3>
          </div>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Academic oversight, prototype safety certification, and milestone review.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {reviews.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              icon={History}
            >
              Feedback History ({reviews.length})
            </Button>
          )}

          {isStudent && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRequestModal(true)}
              icon={Send}
              className="bg-gov-maroon text-white"
            >
              Request Review
            </Button>
          )}

          {isFacultyOrAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFeedbackModal(true)}
              icon={Sparkles}
              className="bg-emerald-700 text-white"
            >
              Record Evaluation
            </Button>
          )}
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!mentor ? (
        <Card accent="none" className="py-12 text-center text-xs text-gov-text-muted space-y-2">
          <GraduationCap className="w-8 h-8 text-gov-maroon mx-auto" />
          <p className="font-bold text-gov-navy text-sm">Faculty Mentor Pending Allocation</p>
          <p className="max-w-md mx-auto">
            The university academic innovation cell will assign a supervising faculty mentor to guide and verify your technical sprint milestones.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Mentor Profile Card */}
          <Card accent="navy" title="Faculty Mentor Profile & Academic Governance">
            <div className="space-y-4 text-xs">
              {/* Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gov-sand-50 rounded-xs border border-gov-border">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    Supervising Faculty Lead
                  </span>
                  <div className="text-base font-bold text-gov-navy">
                    {mentor.name}
                  </div>
                  <div className="text-gov-maroon font-semibold">
                    {mentor.department}
                  </div>
                  <div className="text-gray-600 flex items-center space-x-1.5 pt-1">
                    <Building className="w-3.5 h-3.5 text-gray-500" />
                    <span>{mentor.university?.name || project?.universityId?.name || 'Affiliated Institution'}</span>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-gov-border sm:pl-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Contact & Office Hours
                    </span>
                    <a
                      href={`mailto:${mentor.email}`}
                      className="text-gov-maroon underline font-mono text-xs flex items-center space-x-1 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{mentor.email}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Specialization & Domain Focus
                    </span>
                    <p className="text-gov-navy font-medium mt-0.5">
                      {mentor.specialization || mentor.expertise?.join(', ') || 'Civic Systems, Embedded Hardware & Environmental Engineering'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Status & Last Feedback */}
              <div className="p-4 bg-white border border-gov-border rounded-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Current Review Status
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs text-xs font-bold uppercase mt-1 inline-block ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="text-right sm:text-right text-[11px]">
                    {project.upcomingMentorReview ? (
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase">Upcoming Scheduled Review</span>
                        <strong className="text-gov-navy font-mono">
                          {new Date(project.upcomingMentorReview).toLocaleDateString('en-IN')}
                        </strong>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No upcoming review scheduled yet</span>
                    )}
                  </div>
                </div>

                {/* Last Feedback Snippet */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gov-navy uppercase text-[10px]">
                      Latest Supervision Feedback
                    </span>
                    {project.lastMentorFeedbackDate && (
                      <span className="text-gray-400 font-mono text-[10px]">
                        Recorded {new Date(project.lastMentorFeedbackDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>

                  {project.lastMentorFeedback ? (
                    <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-3 rounded-xs border border-gov-border">
                      "{project.lastMentorFeedback}"
                    </p>
                  ) : (
                    <p className="text-gray-400 italic bg-gov-sand-50 p-3 rounded-xs border border-gov-border text-center">
                      No feedback recorded yet. Click "Request Review" to invite your mentor to evaluate current deliverables.
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Supervision Policy Alert */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xs text-[11px] text-amber-900 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Academic Authority Protocol:</strong> Faculty mentors provide technical supervision under Samadhan Setu Innovation Council guidelines. Students cannot edit faculty evaluations or modify institutional mentor records.
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal 1: Request Review (Student Action) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Send className="w-5 h-5 text-gov-maroon" />
                <span>Request Faculty Mentorship Review</span>
              </h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestReview} className="space-y-3 text-xs">
              <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
                <span className="font-bold text-gov-navy block text-sm">{mentor?.name}</span>
                <span className="text-[11px] text-gray-500">{mentor?.department} &bull; {mentor?.email}</span>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Specific Review Notes & Focus Area *
                </label>
                <textarea
                  rows={4}
                  required
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Team has completed Milestone 1 PCB telemetry testing with 96.4% detection accuracy. Requesting feedback on field deployment protocols..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowRequestModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-gov-maroon text-white">
                  {submitting ? 'Sending Request...' : 'Send Review Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Feedback History */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <History className="w-5 h-5 text-gov-maroon" />
                <span>Mentorship Review History ({reviews.length})</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-3.5 bg-gov-sand-50 rounded-xs border border-gov-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-navy">
                      {rev.facultyName || mentor?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(rev.reviewDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-gov-text-secondary leading-relaxed bg-white p-2.5 rounded-xs border border-gov-border">
                    {rev.feedback}
                  </p>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                      REVIEW_STATUS_CONFIG[rev.reviewStatus]?.color || 'bg-gray-100 text-gray-700'
                    }`}>
                      {REVIEW_STATUS_CONFIG[rev.reviewStatus]?.label || rev.reviewStatus}
                    </span>
                    {rev.upcomingReviewDate && (
                      <span className="text-gray-500 font-mono text-[10px]">
                        Next Follow-up: {new Date(rev.upcomingReviewDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gov-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(false)}>
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Record Evaluation (Faculty / Admin Action) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gov-border rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-border pb-3">
              <h3 className="font-bold text-gov-navy text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span>Record Mentorship Evaluation</span>
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Progress Review Status
                </label>
                <select
                  value={feedbackForm.reviewStatus}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, reviewStatus: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 bg-white outline-none"
                >
                  <option value="SATISFACTORY">Satisfactory Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="NEEDS_IMPROVEMENT">Action & Revision Required</option>
                  <option value="ACTION_REQUIRED">Critical Revision Required</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Mentorship Feedback & Technical Guidance *
                </label>
                <textarea
                  rows={4}
                  required
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  placeholder="Detail evaluation, laboratory findings, schematic critique, and sprint guidance..."
                  className="w-full font-serif border border-gov-border rounded-xs p-2 outline-none focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  Upcoming Review Date (Optional)
                </label>
                <input
                  type="date"
                  value={feedbackForm.upcomingReviewDate}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, upcomingReviewDate: e.target.value })}
                  className="w-full font-serif border border-gov-border rounded-xs px-3 py-2 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setShowFeedbackModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting} className="bg-emerald-700 text-white">
                  {submitting ? 'Recording...' : 'Submit Evaluation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyMentorSection;
