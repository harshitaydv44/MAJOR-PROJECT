import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { projectService } from '../../services/projectService';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  FileText,
  Save,
  Send,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const STATUS_BADGES = {
  DRAFT: { label: 'Draft Formulation', variant: 'subtle', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted to Council', variant: 'navy', color: 'bg-blue-100 text-blue-800 font-bold' },
  UNDER_REVIEW: { label: 'Under Technical Review', variant: 'gold', color: 'bg-purple-100 text-purple-800 font-bold' },
  APPROVED: { label: 'Council Approved', variant: 'emerald', color: 'bg-emerald-100 text-emerald-800 font-bold' },
  NEEDS_REVISION: { label: 'Revision Requested', variant: 'error', color: 'bg-amber-100 text-amber-900 font-bold' }
};

const ProposalSection = ({ project, user, onProjectUpdate }) => {
  const proposal = project?.proposal || {};
  const currentStatus = proposal.approvalStatus || 'DRAFT';

  // Lock rule: editable only when status is DRAFT, NEEDS_REVISION, or not yet created
  const isEditable = !proposal.submittedAt || currentStatus === 'DRAFT' || currentStatus === 'NEEDS_REVISION';
  const isNeedsRevision = currentStatus === 'NEEDS_REVISION';
  const isApproved = currentStatus === 'APPROVED';

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      problemUnderstanding: proposal.problemUnderstanding || '',
      proposedSolution: proposal.proposedSolution || '',
      methodology: proposal.methodology || '',
      technology: Array.isArray(proposal.technology)
        ? proposal.technology.join(', ')
        : proposal.technology || '',
      timeline: proposal.timeline || project?.timeline || '6 Months (3 Sprints)',
      expectedImpact: proposal.expectedImpact || ''
    }
  });

  useEffect(() => {
    if (project?.proposal) {
      reset({
        problemUnderstanding: project.proposal.problemUnderstanding || '',
        proposedSolution: project.proposal.proposedSolution || '',
        methodology: project.proposal.methodology || '',
        technology: Array.isArray(project.proposal.technology)
          ? project.proposal.technology.join(', ')
          : project.proposal.technology || '',
        timeline: project.proposal.timeline || project.timeline || '6 Months (3 Sprints)',
        expectedImpact: project.proposal.expectedImpact || ''
      });
    }
  }, [project, reset]);

  // Handler: Save Draft
  const onSaveDraft = async (data) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const techArray = data.technology
        ? data.technology.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await projectService.saveProposalDraft(project._id, {
        ...data,
        technology: techArray
      });

      setSuccessMsg('Proposal draft saved successfully. You can continue editing anytime.');
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save proposal draft');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Submit Formal Proposal
  const onSubmitProposal = async (data) => {
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const techArray = data.technology
        ? data.technology.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await projectService.submitProposal(project._id, {
        ...data,
        technology: techArray,
        isDraft: false
      });

      setSuccessMsg('Formal technical proposal submitted to Samadhan Setu Innovation Council!');
      if (onProjectUpdate) await onProjectUpdate();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = STATUS_BADGES[currentStatus] || STATUS_BADGES.DRAFT;

  return (
    <div className="space-y-6 max-w-4xl font-serif">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-gov-border rounded-xs shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gov-maroon" />
            <h3 className="text-base font-bold text-gov-navy">
              Technical Solution Proposal
            </h3>
          </div>
          <p className="text-xs text-gov-text-secondary">
            Formal engineering proposal submitted to Samadhan Setu Innovation Council for technical evaluation.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-xs text-xs uppercase font-bold border border-gov-border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {proposal.submittedAt && (
            <span className="text-[11px] text-gov-text-muted flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Lodged: {new Date(proposal.submittedAt).toLocaleDateString('en-IN')}</span>
            </span>
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

      {/* Revision Alert Banner */}
      {isNeedsRevision && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xs space-y-2 text-xs text-amber-950">
          <div className="flex items-center space-x-2 font-bold text-amber-900">
            <RotateCcw className="w-4 h-4 text-amber-800" />
            <span>Revision Requested by Council Review Committee</span>
          </div>
          {proposal.reviewNotes ? (
            <p className="bg-white p-3 border border-amber-200 rounded-xs leading-relaxed">
              <strong>Council Feedback:</strong> {proposal.reviewNotes}
            </p>
          ) : (
            <p>Please revise your technical parameters, methodology, and component bill as discussed.</p>
          )}
          <p className="text-[11px] text-amber-800 font-medium">
            The proposal formulation form below has been unlocked. Please address the feedback and click <strong>Submit Proposal</strong>.
          </p>
        </div>
      )}

      {/* Council Review Notes (if Approved) */}
      {isApproved && proposal.reviewNotes && (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xs text-xs text-emerald-950 space-y-1">
          <div className="font-bold flex items-center space-x-1.5 text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>State Council Approval Notes</span>
          </div>
          <p className="bg-white p-2.5 border border-emerald-200 rounded-xs leading-relaxed">
            {proposal.reviewNotes}
          </p>
        </div>
      )}

      {/* Locked Notification if submitted and under review */}
      {!isEditable && !isApproved && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xs text-xs text-blue-950 flex items-start space-x-2.5">
          <Lock className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Proposal Locked Under Review:</strong> Your proposal has been formally submitted to the Samadhan Setu Innovation Council. Silent modifications are disabled while technical evaluation is in progress. If council reviewers require adjustments, a revision request will unlock this form.
          </div>
        </div>
      )}

      {/* Proposal Content: Read-Only Presentation vs Editable Form */}
      {!isEditable ? (
        <Card accent="maroon" title="Formal Solution Formulation (Locked Record)">
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-gov-navy uppercase text-[11px] block">
                1. Problem Understanding & Analysis
              </span>
              <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-3 border border-gov-border rounded-xs whitespace-pre-line">
                {proposal.problemUnderstanding || 'None provided'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-gov-navy uppercase text-[11px] block">
                2. Proposed Technical Solution & Architecture
              </span>
              <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-3 border border-gov-border rounded-xs whitespace-pre-line">
                {proposal.proposedSolution || 'None provided'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-gov-navy uppercase text-[11px] block">
                3. Engineering Methodology & Validation Plan
              </span>
              <p className="text-gov-text-secondary leading-relaxed bg-gov-sand-50 p-3 border border-gov-border rounded-xs whitespace-pre-line">
                {proposal.methodology || 'None provided'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-gov-navy uppercase text-[11px] block">
                4. Technology / Tools
              </span>
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-gov-sand-50 border border-gov-border rounded-xs">
                {(Array.isArray(proposal.technology) ? proposal.technology : [proposal.technology].filter(Boolean)).map(
                  (tech, idx) => (
                    <span key={idx} className="bg-white border border-gov-border px-2 py-0.5 rounded-xs text-[11px] font-mono">
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="font-bold text-gov-navy uppercase text-[11px] block">
                  5. Implementation Timeline
                </span>
                <p className="text-gov-text-secondary bg-gov-sand-50 p-2.5 border border-gov-border rounded-xs">
                  {proposal.timeline || '6 Months'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gov-navy uppercase text-[11px] block">
                  6. Anticipated Civic Relief & Impact
                </span>
                <p className="text-gov-text-secondary bg-gov-sand-50 p-2.5 border border-gov-border rounded-xs">
                  {proposal.expectedImpact || 'Municipal ward relief'}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xs text-[11px] text-amber-900 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Self-Approval Prevention:</strong> Students cannot approve their own proposal. Formal approval is authorized exclusively by the Samadhan Setu Innovation Council.
              </span>
            </div>
          </div>
        </Card>
      ) : (
        /* React Hook Form Editable Formulation */
        <Card accent="maroon" title={isNeedsRevision ? 'Update Proposal Formulation (Revision Mode)' : 'Formulate Solution Proposal'}>
          <form className="space-y-4 text-xs">
            {/* Field 1: Problem Understanding */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                1. Problem Understanding & Analysis *
              </label>
              <textarea
                rows={3}
                {...register('problemUnderstanding', {
                  required: 'Problem understanding analysis is required',
                  minLength: { value: 20, message: 'Please provide at least 20 characters of problem analysis' }
                })}
                placeholder="Detail your engineering analysis of the civic problem, field conditions, and root causes..."
                className={`w-full font-serif border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy ${
                  errors.problemUnderstanding ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                }`}
              />
              {errors.problemUnderstanding && (
                <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                  {errors.problemUnderstanding.message}
                </span>
              )}
            </div>

            {/* Field 2: Proposed Solution */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                2. Proposed Technical Solution & Architecture *
              </label>
              <textarea
                rows={3}
                {...register('proposedSolution', {
                  required: 'Proposed solution description is required',
                  minLength: { value: 20, message: 'Please provide at least 20 characters describing your technical solution' }
                })}
                placeholder="Explain your technical solution, subsystem design, sensors, algorithms, and engineering innovations..."
                className={`w-full font-serif border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy ${
                  errors.proposedSolution ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                }`}
              />
              {errors.proposedSolution && (
                <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                  {errors.proposedSolution.message}
                </span>
              )}
            </div>

            {/* Field 3: Methodology */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                3. Engineering Methodology & Validation Plan *
              </label>
              <textarea
                rows={3}
                {...register('methodology', {
                  required: 'Engineering methodology is required',
                  minLength: { value: 20, message: 'Please detail your prototyping methodology and verification steps' }
                })}
                placeholder="Prototyping methodology, laboratory benchtesting protocols, safety checks, and field testing steps..."
                className={`w-full font-serif border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy ${
                  errors.methodology ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                }`}
              />
              {errors.methodology && (
                <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                  {errors.methodology.message}
                </span>
              )}
            </div>

            {/* Field 4 & 5: Tech and Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  4. Technology / Tools (Comma-separated) *
                </label>
                <input
                  type="text"
                  {...register('technology', {
                    required: 'Technology stack and tools are required'
                  })}
                  placeholder="e.g. ESP32, LoRaWAN IN865, Piezo Hydrophones, React, Node.js"
                  className={`w-full font-serif border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-gov-navy ${
                    errors.technology ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                  }`}
                />
                {errors.technology && (
                  <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                    {errors.technology.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                  5. Implementation Timeline *
                </label>
                <input
                  type="text"
                  {...register('timeline', {
                    required: 'Timeline estimate is required'
                  })}
                  placeholder="e.g. 6 Months (3 Sprints)"
                  className={`w-full font-serif border rounded-xs px-3 py-2 outline-none focus:ring-1 focus:ring-gov-navy ${
                    errors.timeline ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                  }`}
                />
                {errors.timeline && (
                  <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                    {errors.timeline.message}
                  </span>
                )}
              </div>
            </div>

            {/* Field 6: Expected Impact */}
            <div>
              <label className="block font-bold text-gov-navy uppercase tracking-wider mb-1">
                6. Expected Civic Impact & Relief *
              </label>
              <textarea
                rows={2}
                {...register('expectedImpact', {
                  required: 'Expected civic impact is required',
                  minLength: { value: 10, message: 'Please describe the expected impact' }
                })}
                placeholder="Estimated citizens benefited, water conserved, cost reductions, or civic relief benchmarks..."
                className={`w-full font-serif border rounded-xs p-2.5 outline-none focus:ring-1 focus:ring-gov-navy ${
                  errors.expectedImpact ? 'border-rose-400 bg-rose-50/30' : 'border-gov-border'
                }`}
              />
              {errors.expectedImpact && (
                <span className="text-rose-600 text-[11px] font-semibold mt-0.5 block">
                  {errors.expectedImpact.message}
                </span>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-gov-text-muted">
                Student self-approval is restricted. Formal sign-off is certified by the Samadhan Setu Innovation Council.
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSubmit(onSaveDraft)}
                  disabled={submitting}
                  icon={Save}
                >
                  {submitting ? 'Saving...' : 'Save Draft'}
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit(onSubmitProposal)}
                  disabled={submitting}
                  icon={Send}
                  className="bg-gov-maroon text-white"
                >
                  {submitting ? 'Submitting...' : isNeedsRevision ? 'Submit Revised Proposal' : 'Submit Proposal'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProposalSection;
