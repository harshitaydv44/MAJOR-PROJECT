import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { projectService } from '../../services/projectService';
import {
  FlaskConical,
  Plus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileCheck,
  FileText,
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Award,
  X,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const TEST_STATUS_CONFIG = {
  PLANNED: { label: 'Planned', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  PASSED: { label: 'Passed & Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  FAILED: { label: 'Failed Benchmarks', color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' },
  RETEST_REQUIRED: { label: 'Retest Required', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' }
};

const TestingSection = ({ project, onProjectUpdated, userRole, currentUserId }) => {
  const testRecords = project.testRecords || [];

  const isStudent = userRole === 'STUDENT';
  const isFacultyOrAuthority = ['FACULTY', 'UNIVERSITY', 'ADMIN'].includes(userRole);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Target test record for evidence / review
  const [selectedTest, setSelectedTest] = useState(null);

  // Log test trial form
  const [logForm, setLogForm] = useState({
    testName: '',
    objective: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    participantsSampleSize: '',
    method: '',
    result: '',
    issuesFound: '',
    status: 'IN_PROGRESS'
  });

  // Evidence upload form
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');

  // Review form
  const [reviewForm, setReviewForm] = useState({
    status: 'PASSED',
    reviewerFeedback: ''
  });

  // Action status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Log New Test
  const handleOpenLogModal = () => {
    setLogForm({
      testName: '',
      objective: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      participantsSampleSize: '',
      method: '',
      result: '',
      issuesFound: '',
      status: 'IN_PROGRESS'
    });
    setErrorMsg('');
    setIsLogModalOpen(true);
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (isStudent && logForm.status === 'PASSED') {
      setErrorMsg('Self-Approval Guard: Students cannot mark tests as PASSED. Sign-off is reserved for Faculty Mentors.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.createProjectTest(project._id, logForm);
      setSuccessMsg('Empirical test trial recorded in project verification suite!');
      setIsLogModalOpen(false);
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to record test trial');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Upload Evidence
  const handleOpenEvidenceModal = (test) => {
    setSelectedTest(test);
    setEvidenceFile(null);
    setEvidenceTitle('');
    setErrorMsg('');
    setIsEvidenceModalOpen(true);
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceFile) {
      setErrorMsg('Please select an evidence file to upload');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const data = new FormData();
      data.append('file', evidenceFile);
      if (evidenceTitle) data.append('title', evidenceTitle.trim());

      await projectService.uploadTestEvidence(project._id, selectedTest._id, data);
      setSuccessMsg('Test evidence artifact uploaded to Cloudinary and attached successfully!');
      setIsEvidenceModalOpen(false);
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload test evidence');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Faculty / Review Authority Evaluation
  const handleOpenReviewModal = (test) => {
    setSelectedTest(test);
    setReviewForm({
      status: test.status === 'PASSED' ? 'PASSED' : 'PASSED',
      reviewerFeedback: test.reviewerFeedback || ''
    });
    setErrorMsg('');
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewerFeedback.trim()) {
      setErrorMsg('Please provide evaluation feedback explaining your verdict');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await projectService.reviewProjectTest(project._id, selectedTest._id, reviewForm);
      setSuccessMsg('Official faculty evaluation verdict and feedback recorded!');
      setIsReviewModalOpen(false);
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to evaluate test trial');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const passedTests = testRecords.filter((t) => t.status === 'PASSED').length;
  const inProgressTests = testRecords.filter((t) => t.status === 'IN_PROGRESS').length;
  const retestTests = testRecords.filter((t) => t.status === 'RETEST_REQUIRED').length;

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border">
              EMPIRICAL TESTING SUITE
            </span>
            <span className="text-xs text-gov-text-muted">
              Trials Logged: <strong>{testRecords.length}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-gov-navy mt-1">
            Laboratory & Field Validation Trials
          </h2>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Document rigorous benchtop calibrations, stress tests, and live civic pilot results with verified multimedia evidence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenLogModal}
            icon={Plus}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Log Test Trial
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card accent="none" className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Total Test Trials</span>
          <span className="text-lg font-bold text-gov-navy mt-1 block">{testRecords.length}</span>
        </Card>
        <Card accent="none" className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">In Progress</span>
          <span className="text-lg font-bold text-blue-800 mt-1 block">{inProgressTests}</span>
        </Card>
        <Card accent="none" className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Verified Passed</span>
          <span className="text-lg font-bold text-emerald-800 mt-1 block">{passedTests}</span>
        </Card>
        <Card accent="none" className="p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Retests Required</span>
          <span className="text-lg font-bold text-amber-800 mt-1 block">{retestTests}</span>
        </Card>
      </div>

      {/* Self-Approval Policy Banner */}
      <div className="p-3.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-start space-x-2.5 text-xs text-gov-text-secondary">
        <ShieldCheck className="w-4 h-4 text-gov-maroon shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-gov-navy block">Academic Rigor & Self-Approval Guard:</span>
          <span>
            Student Innovators can record trials, log issues, and upload empirical evidence. Marking trials as <strong>PASSED</strong> requires academic evaluation and sign-off by assigned Faculty Mentors or University Reviewers.
          </span>
        </div>
      </div>

      {/* Test Records List */}
      {testRecords.length === 0 ? (
        <div className="bg-white border border-gov-border rounded-xs p-10 text-center space-y-3">
          <FlaskConical className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-gov-navy text-sm">No Test Trials Recorded Yet</h3>
          <p className="text-xs text-gov-text-secondary max-w-md mx-auto">
            Empirical validation is required before municipal deployment. Log your first laboratory benchtop calibration or field trial above.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenLogModal}
            icon={Plus}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Log First Test Trial
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {testRecords.map((t, idx) => {
            const statusConfig = TEST_STATUS_CONFIG[t.status] || TEST_STATUS_CONFIG.IN_PROGRESS;
            const hasReview = Boolean(t.reviewedBy || t.reviewerFeedback);

            return (
              <Card
                key={t._id || idx}
                accent={t.status === 'PASSED' ? 'maroon' : t.status === 'FAILED' ? 'none' : 'navy'}
                className="space-y-4"
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono font-bold text-gov-navy text-sm">
                        {t.testName}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-gov-text-muted flex-wrap">
                      {t.date && (
                        <span className="flex items-center space-x-1 font-mono">
                          <Calendar className="w-3 h-3 text-gov-maroon" />
                          <span>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                        </span>
                      )}
                      {t.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gov-navy" />
                          <span>{t.location}</span>
                        </span>
                      )}
                      {t.participantsSampleSize && (
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-gray-500" />
                          <span>Sample: {t.participantsSampleSize}</span>
                        </span>
                      )}
                      {t.testedByName && (
                        <span className="text-[10px] text-gray-500">
                          Logged by: <strong>{t.testedByName}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions on this record */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleOpenEvidenceModal(t)}
                      icon={Upload}
                      className="text-xs text-gov-navy"
                    >
                      Attach Evidence
                    </Button>

                    {isFacultyOrAuthority && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenReviewModal(t)}
                        icon={Award}
                        className="bg-gov-navy text-white text-xs font-bold"
                      >
                        Evaluate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Body Details: Objective, Method, Result, Issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Objective & Method */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gov-text-muted block">
                        Objective & Hypothesis
                      </span>
                      <p className="text-gov-text-secondary mt-0.5 leading-relaxed">
                        {t.objective}
                      </p>
                    </div>

                    {t.method && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gov-text-muted block">
                          Experimental Protocol / Method
                        </span>
                        <p className="text-gov-text-secondary mt-0.5 leading-relaxed font-mono text-[11px] bg-gov-sand-50 p-2 rounded-xs border border-gov-border">
                          {t.method}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Result & Issues */}
                  <div className="space-y-3">
                    {t.result && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gov-text-muted block">
                          Observed Outcome & Performance Metrics
                        </span>
                        <p className="text-gov-navy font-medium mt-0.5 leading-relaxed">
                          {t.result}
                        </p>
                      </div>
                    )}

                    {t.issuesFound && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xs">
                        <span className="text-[10px] font-bold uppercase text-rose-800 flex items-center space-x-1 mb-0.5">
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                          <span>Anomalies / Issues Encountered</span>
                        </span>
                        <p className="text-rose-900 text-xs leading-relaxed">
                          {t.issuesFound}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Artifacts Bar */}
                {t.evidence && t.evidence.length > 0 && (
                  <div className="pt-3 border-t border-gov-border">
                    <span className="text-[10px] font-bold uppercase text-gov-text-muted block mb-2">
                      Verified Multimedia Evidence ({t.evidence.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {t.evidence.map((ev, evIdx) => (
                        <a
                          key={ev._id || evIdx}
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xs bg-gov-sand-100 hover:bg-gov-sand-200 border border-gov-border text-xs text-gov-navy font-semibold transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate max-w-[180px]">{ev.title || 'Evidence File'}</span>
                          <ExternalLink className="w-3 h-3 text-gray-500 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Feedback Card */}
                {hasReview ? (
                  <div className="p-3 bg-gov-sand-100 border-l-4 border-gov-maroon rounded-xs space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-gov-maroon flex items-center space-x-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Official Evaluation Verdict: <strong>{t.status}</strong></span>
                      </span>
                      <span className="text-gray-500 font-mono">
                        {t.reviewedAt ? new Date(t.reviewedAt).toLocaleDateString('en-IN') : ''}
                      </span>
                    </div>
                    {t.reviewerFeedback && (
                      <p className="text-gov-navy italic">
                        "{t.reviewerFeedback}"
                      </p>
                    )}
                    <div className="text-[10px] text-gray-500 text-right">
                      Evaluated by: <strong>{t.reviewedByName || 'Faculty Supervisor'}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-gov-text-muted italic flex items-center space-x-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Pending evaluation sign-off by Faculty Supervisor.</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Log Test Trial */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Log Empirical Test Trial
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-gray-400 hover:text-gov-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveLog} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Test Name & Date */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Test Name / Protocol Scope <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={logForm.testName}
                    onChange={(e) => setLogForm((prev) => ({ ...prev, testName: e.target.value }))}
                    placeholder="e.g. Ultrasonic Hydrophone Acoustic Attenuation Test"
                    required
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Trial Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm((prev) => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-mono focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
              </div>

              {/* Location & Sample Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Testing Location / Environment
                  </label>
                  <input
                    type="text"
                    value={logForm.location}
                    onChange={(e) => setLogForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Hydraulic Flow Rig, Lab B-204"
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Participants / Sample Size
                  </label>
                  <input
                    type="text"
                    value={logForm.participantsSampleSize}
                    onChange={(e) => setLogForm((prev) => ({ ...prev, participantsSampleSize: e.target.value }))}
                    placeholder="e.g. 24 sensor iterations or 15 trials"
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
              </div>

              {/* Objective */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Test Objective & Hypothesis <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={logForm.objective}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, objective: e.target.value }))}
                  placeholder="State the scientific or empirical hypothesis being validated..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Method */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Protocol Methodology & Setup
                </label>
                <textarea
                  rows={2}
                  value={logForm.method}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, method: e.target.value }))}
                  placeholder="Equipment used, calibration sequence, pressure levels, telemetry baud rate..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Result */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Observed Outcome & Performance Metrics
                </label>
                <textarea
                  rows={2}
                  value={logForm.result}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, result: e.target.value }))}
                  placeholder="Quantifiable observations: e.g. Detected 0.8mm leak at 2.4 bar with 620ms latency..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Issues Found */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Issues / Anomalies Discovered
                </label>
                <input
                  type="text"
                  value={logForm.issuesFound}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, issuesFound: e.target.value }))}
                  placeholder="e.g. Signal clipping occurred above 3.5 bar; needs analog gain reduction"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Initial Status */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Trial Status
                </label>
                <select
                  value={logForm.status}
                  onChange={(e) => setLogForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PLANNED">Planned</option>
                  <option value="FAILED">Failed Benchmarks</option>
                  <option value="RETEST_REQUIRED">Retest Required</option>
                  {isFacultyOrAuthority && (
                    <option value="PASSED">Passed (Faculty Verification)</option>
                  )}
                </select>
                {isStudent && (
                  <span className="text-[10px] text-gov-text-muted mt-1 block">
                    * Students cannot self-approve trials as PASSED. Faculty supervisor evaluation is required.
                  </span>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsLogModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-gov-maroon text-white font-bold"
                >
                  {submitting ? 'Recording Trial...' : 'Save Test Trial Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Attach Evidence */}
      {isEvidenceModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Upload Test Evidence File
                </h3>
              </div>
              <button
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-gray-400 hover:text-gov-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadEvidence} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <span className="text-gov-text-muted block text-[10px] uppercase font-bold">Attaching to:</span>
                <span className="font-bold text-gov-navy text-xs">{selectedTest.testName}</span>
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Evidence Title / Description
                </label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Oscilloscope FFT Waveform Capture at 3 Bar"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Evidence File (Cloudinary) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEvidenceFile(e.target.files[0]);
                      if (!evidenceTitle) setEvidenceTitle(e.target.files[0].name);
                    }
                  }}
                  required
                  className="w-full p-2 border border-dashed border-gov-border rounded-xs bg-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gov-sand-100 file:text-gov-navy hover:file:bg-gov-sand-200"
                />
                <span className="text-[10px] text-gov-text-muted mt-0.5 block">
                  Accepted: PDF reports, photos/diagrams (PNG, JPG), data dumps (CSV).
                </span>
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsEvidenceModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-gov-maroon text-white font-bold"
                >
                  {submitting ? 'Uploading to Cloudinary...' : 'Upload Evidence'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Faculty / Authority Evaluation */}
      {isReviewModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Evaluate Test Trial & Sign Off
                </h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gov-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <span className="text-gov-text-muted block text-[10px] uppercase font-bold">Evaluating Protocol:</span>
                <span className="font-bold text-gov-navy text-xs">{selectedTest.testName}</span>
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Evaluation Verdict <span className="text-rose-600">*</span>
                </label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="PASSED">PASSED — Empirical Verification Approved</option>
                  <option value="FAILED">FAILED — Does Not Meet Benchmark</option>
                  <option value="RETEST_REQUIRED">RETEST REQUIRED — Re-calibrate & Repeat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Reviewer Evaluation Feedback & Notes <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewForm.reviewerFeedback}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewerFeedback: e.target.value }))}
                  placeholder="Provide technical assessment, validation remarks, or required corrections..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-gov-navy text-white font-bold"
                >
                  {submitting ? 'Recording Verdict...' : 'Submit Evaluation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingSection;
