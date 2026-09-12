import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import LoadingState from '../common/LoadingState';
import { projectService } from '../../services/projectService';
import {
  Building2,
  Handshake,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  GraduationCap,
  Calendar,
  MapPin,
  Send,
  X,
  Sparkles,
  AlertCircle,
  Award
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-50 text-amber-900 border-amber-300 font-bold' },
  ACCEPTED: { label: 'Partnership Accepted', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' },
  ACTIVE: { label: 'Active Co-Development', color: 'bg-gov-maroon text-white border-gov-maroon font-bold' },
  REJECTED: { label: 'Outreach Declined', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  COMPLETED: { label: 'Completed', color: 'bg-stone-100 text-stone-700 border-stone-300' }
};

const IndustrySection = ({ project, onProjectUpdated, userRole }) => {
  const [partnerships, setPartnerships] = useState([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const isStudent = userRole === 'STUDENT';
  const isAuthority = ['INDUSTRY', 'UNIVERSITY', 'ADMIN'].includes(userRole);

  // Collaboration Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [form, setForm] = useState({
    industryId: '',
    requestedSupport: 'MENTORSHIP',
    reason: '',
    message: ''
  });

  // Evaluate Modal (Industry / University / Admin only)
  const [evaluatingPartnership, setEvaluatingPartnership] = useState(null);
  const [evalForm, setEvalForm] = useState({
    status: 'ACCEPTED',
    reviewNotes: '',
    assignedMentorName: '',
    assignedMentorEmail: '',
    assignedMentorDesignation: ''
  });

  const fetchPartnerships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getProjectPartnerships(project._id);
      setPartnerships(res.data?.partnerships || res.partnerships || []);

      // Fetch available industry registry for dropdown
      const indRes = await projectService.getStudentIndustryPartners({ projectId: project._id });
      const partnersList = indRes.data?.partners || indRes.partners || [];
      setAvailablePartners(partnersList);

      if (partnersList.length > 0 && !form.industryId) {
        setForm((prev) => ({ ...prev, industryId: partnersList[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load project industry partnerships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, [project._id]);

  const handleOpenModal = () => {
    setModalError('');
    setForm({
      industryId: availablePartners[0]?._id || '',
      requestedSupport: 'MENTORSHIP',
      reason: '',
      message: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.industryId) {
      setModalError('Please select a registered industry partner');
      return;
    }
    if (!form.reason.trim()) {
      setModalError('Please state the rationale for this collaboration');
      return;
    }
    if (!form.message.trim()) {
      setModalError('Please provide outreach proposal details');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      await projectService.requestStudentIndustryCollaboration({
        projectId: project._id,
        industryId: form.industryId,
        requestedSupport: form.requestedSupport,
        reason: form.reason.trim(),
        message: form.message.trim()
      });

      setSuccessMsg('Industry collaboration outreach submitted successfully!');
      setIsModalOpen(false);
      fetchPartnerships();
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit collaboration request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEvaluateModal = (p) => {
    setEvaluatingPartnership(p);
    setEvalForm({
      status: p.status === 'PENDING' ? 'ACCEPTED' : p.status,
      reviewNotes: p.reviewNotes || '',
      assignedMentorName: p.assignedMentor?.name || '',
      assignedMentorEmail: p.assignedMentor?.email || '',
      assignedMentorDesignation: p.assignedMentor?.designation || ''
    });
    setModalError('');
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    try {
      const payload = {
        status: evalForm.status,
        reviewNotes: evalForm.reviewNotes.trim(),
        assignedMentor: evalForm.assignedMentorName
          ? {
              name: evalForm.assignedMentorName.trim(),
              email: evalForm.assignedMentorEmail.trim(),
              designation: evalForm.assignedMentorDesignation.trim()
            }
          : undefined
      };

      await projectService.updatePartnershipStatus(project._id, evaluatingPartnership._id, payload);
      setSuccessMsg('Partnership evaluation verdict saved and student notified!');
      setEvaluatingPartnership(null);
      fetchPartnerships();
      if (onProjectUpdated) onProjectUpdated();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update partnership status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading project industry partnerships & corporate commitments..." />;
  }

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gov-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-gov-maroon bg-gov-sand-50 px-2 py-0.5 rounded-xs border border-gov-border">
              CORPORATE CO-DEVELOPMENT
            </span>
            <span className="text-xs text-gov-text-muted">
              Active Partnerships: <strong>{partnerships.filter((p) => ['ACCEPTED', 'ACTIVE'].includes(p.status)).length}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-gov-navy mt-1">
            Industry Partnerships & Co-Sponsorships
          </h2>
          <p className="text-xs text-gov-text-secondary mt-0.5">
            Accredited industrial partners, specialized testing facilities, corporate CSR sponsorships, and assigned industry mentors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            icon={Handshake}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Request Industry Support
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

      {/* Governance Banner */}
      <div className="p-3.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-start space-x-2.5 text-xs text-gov-text-secondary">
        <ShieldCheck className="w-4 h-4 text-gov-maroon shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-gov-navy block">Security & Corporate Governance:</span>
          <span>
            Student innovators can submit outreach requests. Corporate partner profiles, funding commitments, and status changes to <strong>ACCEPTED</strong> / <strong>ACTIVE</strong> are approved exclusively by verified industry representatives and University Nodal Officers.
          </span>
        </div>
      </div>

      {/* Partnerships Listing */}
      {partnerships.length === 0 ? (
        <div className="bg-white border border-gov-border rounded-xs p-12 text-center space-y-4">
          <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gov-navy">No industry partnerships yet.</h3>
            <p className="text-xs text-gov-text-secondary max-w-md mx-auto">
              No industrial co-sponsors or testing facilities are currently linked to this innovation project. Connect with accredited corporate partners to access technical facilities and prototyping support.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            icon={Handshake}
            className="bg-gov-maroon text-white font-bold text-xs"
          >
            Request Industry Support
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {partnerships.map((p) => {
            const partnerName = p.industry?.organization || p.industryProfile?.name || p.industry?.name || 'Corporate Partner';
            const sector = p.industryProfile?.industrySector || 'Clean Energy & Infrastructure';
            const district = p.industry?.district || p.industryProfile?.district || 'Delhi NCR';
            const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING;
            const isPermittedContact = ['ACCEPTED', 'ACTIVE', 'COMPLETED'].includes(p.status);

            return (
              <Card
                key={p._id}
                accent={['ACCEPTED', 'ACTIVE'].includes(p.status) ? 'maroon' : p.status === 'PENDING' ? 'gold' : 'none'}
                className="space-y-4"
              >
                {/* Header Row: Partner, Support & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gov-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-bold text-gov-navy text-base">{partnerName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-blue-50 text-blue-900 border border-blue-200">
                        {p.supportType}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-xs border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-gov-text-secondary flex items-center space-x-3">
                      <span>{sector}</span>
                      <span>&bull;</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gov-maroon" />
                        <span>{district}</span>
                      </span>
                    </div>
                  </div>

                  {/* Authority Evaluation Action */}
                  {isAuthority && (
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleOpenEvaluateModal(p)}
                      icon={Award}
                      className="text-xs font-bold text-gov-navy shrink-0"
                    >
                      Evaluate Partnership
                    </Button>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Support & Description */}
                  <div className="space-y-2">
                    {p.reason && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                          Outreach Strategic Rationale
                        </span>
                        <p className="text-gov-text-secondary mt-0.5 leading-relaxed">
                          {p.reason}
                        </p>
                      </div>
                    )}

                    {p.message && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                          Proposal Description
                        </span>
                        <p className="text-gov-navy mt-0.5 italic bg-gov-sand-50 p-2.5 rounded-xs border border-gov-border">
                          "{p.message}"
                        </p>
                      </div>
                    )}

                    {p.resourcesOffered && p.resourcesOffered.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                          Committed Industrial Resources
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gov-navy">
                          {p.resourcesOffered.map((res, idx) => (
                            <li key={idx}>{res}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Contact / Mentor & Authority Review */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                        Contact / Assigned Industrial Mentor
                      </span>
                      {isPermittedContact ? (
                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xs space-y-1 mt-1">
                          {p.assignedMentor?.name ? (
                            <>
                              <div className="font-bold text-gov-navy text-xs flex items-center space-x-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-gov-maroon" />
                                <span>{p.assignedMentor.name}</span>
                              </div>
                              <div className="text-[11px] text-gray-600">
                                {p.assignedMentor.designation || 'Senior Grid Engineer'}
                              </div>
                              {p.assignedMentor.email && (
                                <div className="text-[11px] font-mono text-gov-maroon">
                                  {p.assignedMentor.email}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-gov-navy text-xs">{p.industry?.name}</div>
                              <div className="text-[11px] text-gray-600 font-mono">{p.industry?.email}</div>
                              {p.industry?.phone && (
                                <div className="text-[11px] text-gray-500">{p.industry.phone}</div>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs text-[11px] text-gov-text-muted italic mt-1">
                          Direct industrial contact and mentor access will be unlocked upon formal partnership acceptance.
                        </div>
                      )}
                    </div>

                    {p.reviewNotes && (
                      <div className="p-2.5 bg-gov-sand-100 rounded-xs border border-gov-border text-xs">
                        <span className="text-[10px] uppercase font-bold text-gov-maroon block">
                          Reviewer Assessment Notes
                        </span>
                        <p className="text-gov-navy mt-0.5">{p.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Last Update */}
                <div className="pt-2.5 border-t border-gov-border flex items-center justify-between text-[11px] text-gov-text-muted font-mono">
                  <span>
                    Initiated: {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <span>
                    Last Update: {new Date(p.updatedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Request Industry Support */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Handshake className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Request Industry Co-Development Support
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gov-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Target Industry Partner */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Accredited Corporate / Lab Partner <span className="text-rose-600">*</span>
                </label>
                <select
                  value={form.industryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, industryId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  {availablePartners.map((ind) => (
                    <option key={ind._id} value={ind._id}>
                      {ind.company} ({ind.industry})
                    </option>
                  ))}
                </select>
              </div>

              {/* Requested Support Modality */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Requested Support Modality <span className="text-rose-600">*</span>
                </label>
                <select
                  value={form.requestedSupport}
                  onChange={(e) => setForm((prev) => ({ ...prev, requestedSupport: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="MENTORSHIP">MENTORSHIP — Technical & Architectural Advisement</option>
                  <option value="FUNDING">FUNDING — Prototyping & Equipment Grants</option>
                  <option value="TECHNOLOGY">TECHNOLOGY — Software Licenses, Datasets & APIs</option>
                  <option value="PROTOTYPING">PROTOTYPING — Industrial Fab Lab & Workshop Access</option>
                  <option value="TESTING">TESTING — Benchmarking & Sensor Calibration Sites</option>
                  <option value="PILOT">PILOT — Municipal Flow Rig / Substation Field Trials</option>
                  <option value="IMPLEMENTATION">IMPLEMENTATION — Deployment Integration</option>
                  <option value="TECH_TRANSFER">TECH_TRANSFER — Commercialization & IP Licensing</option>
                </select>
              </div>

              {/* Rationale */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Rationale for Collaboration <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this partner's testbeds or mentorship are needed..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Outreach Proposal Message */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Detailed Proposal Message <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Specify equipment, testing protocol schedule, or grant allocation requirements..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  icon={Send}
                  className="bg-gov-maroon text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Send Collaboration Outreach'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Evaluate Partnership (Authority Only) */}
      {evaluatingPartnership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Evaluate Industry Partnership
                </h3>
              </div>
              <button
                onClick={() => setEvaluatingPartnership(null)}
                className="text-gray-400 hover:text-gov-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Partnership Status Verdict <span className="text-rose-600">*</span>
                </label>
                <select
                  value={evalForm.status}
                  onChange={(e) => setEvalForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="ACCEPTED">ACCEPTED — Approve Support Request</option>
                  <option value="ACTIVE">ACTIVE — Formally Activate Co-Development</option>
                  <option value="REJECTED">REJECTED — Decline Request</option>
                  <option value="COMPLETED">COMPLETED — Partnership Concluded</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Assigned Industrial Mentor Name
                </label>
                <input
                  type="text"
                  value={evalForm.assignedMentorName}
                  onChange={(e) => setEvalForm((prev) => ({ ...prev, assignedMentorName: e.target.value }))}
                  placeholder="e.g. Er. Rajiv Singhal"
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Mentor Email
                  </label>
                  <input
                    type="email"
                    value={evalForm.assignedMentorEmail}
                    onChange={(e) => setEvalForm((prev) => ({ ...prev, assignedMentorEmail: e.target.value }))}
                    placeholder="mentor@industry.com"
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                    Mentor Designation
                  </label>
                  <input
                    type="text"
                    value={evalForm.assignedMentorDesignation}
                    onChange={(e) => setEvalForm((prev) => ({ ...prev, assignedMentorDesignation: e.target.value }))}
                    placeholder="Chief Grid Specialist"
                    className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Evaluation Remarks / Feedback Notes
                </label>
                <textarea
                  rows={3}
                  value={evalForm.reviewNotes}
                  onChange={(e) => setEvalForm((prev) => ({ ...prev, reviewNotes: e.target.value }))}
                  placeholder="Notes explaining approval scope, access credentials, or rejection reason..."
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={() => setEvaluatingPartnership(null)}
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
                  {submitting ? 'Saving...' : 'Submit Evaluation Verdict'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySection;
