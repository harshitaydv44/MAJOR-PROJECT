import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  Building2,
  Handshake,
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Send,
  X,
  Layers,
  RefreshCw,
  Coins,
  Cpu,
  FlaskConical,
  Rocket,
  Wrench,
  ArrowRight
} from 'lucide-react';

const SUPPORT_TYPES = [
  { id: 'all', label: 'All Support Types' },
  { id: 'MENTORSHIP', label: 'Mentorship', icon: GraduationCap },
  { id: 'FUNDING', label: 'Funding & Grants', icon: Coins },
  { id: 'TECHNOLOGY', label: 'Technology & Tooling', icon: Cpu },
  { id: 'PROTOTYPING', label: 'Prototyping Labs', icon: Wrench },
  { id: 'TESTING', label: 'Testing Facilities', icon: FlaskConical },
  { id: 'PILOT', label: 'Live Ward Pilots', icon: Rocket },
  { id: 'IMPLEMENTATION', label: 'Implementation', icon: Layers },
  { id: 'TECH_TRANSFER', label: 'Tech Transfer', icon: Sparkles }
];

const STATUS_BADGE_CONFIG = {
  AVAILABLE: { label: 'Available for Outreach', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  PENDING: { label: 'Request Pending Review', color: 'bg-amber-50 text-amber-900 border-amber-300 font-bold' },
  ACCEPTED: { label: 'Partnership Accepted', color: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' },
  ACTIVE: { label: 'Active Co-Development', color: 'bg-gov-maroon text-white border-gov-maroon font-bold' },
  REJECTED: { label: 'Request Declined', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  COMPLETED: { label: 'Collaboration Completed', color: 'bg-stone-100 text-stone-700 border-stone-300' }
};

const StudentIndustryPage = () => {
  const [partners, setPartners] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupportType, setSelectedSupportType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [requestForm, setRequestForm] = useState({
    projectId: '',
    industryId: '',
    requestedSupport: 'MENTORSHIP',
    reason: '',
    message: ''
  });

  // View Partnership Details Modal State
  const [detailsModalPartner, setDetailsModalPartner] = useState(null);

  const fetchIndustryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectService.getStudentIndustryPartners();
      const list = res.data?.partners || res.partners || [];
      const projs = res.data?.studentProjects || res.studentProjects || [];
      setPartners(list);
      setStudentProjects(projs);

      if (projs.length > 0 && !requestForm.projectId) {
        setRequestForm((prev) => ({ ...prev, projectId: projs[0]._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load industry partners directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustryData();
  }, []);

  const handleOpenRequestModal = (partner) => {
    setSelectedPartner(partner);
    setModalError('');
    setRequestForm({
      projectId: studentProjects[0]?._id || '',
      industryId: partner._id,
      requestedSupport: 'MENTORSHIP',
      reason: '',
      message: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
    setModalError('');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.projectId) {
      setModalError('Please select a target project from your enrolled portfolio.');
      return;
    }
    if (!requestForm.reason.trim()) {
      setModalError('Please explain the rationale/synergy for this industry partnership.');
      return;
    }
    if (!requestForm.message.trim()) {
      setModalError('Please provide a specific collaboration proposal message.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        projectId: requestForm.projectId,
        industryId: selectedPartner?.industryUserId || selectedPartner?._id,
        requestedSupport: requestForm.requestedSupport,
        reason: requestForm.reason.trim(),
        message: requestForm.message.trim()
      };

      await projectService.requestStudentIndustryCollaboration(payload);
      setSuccessMsg(`Collaboration request for ${requestForm.requestedSupport} submitted successfully to ${selectedPartner?.company}!`);
      handleCloseRequestModal();
      fetchIndustryData();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to submit collaboration outreach');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered partners
  const filteredPartners = partners.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = (p.company || '').toLowerCase().includes(q);
      const matchIndustry = (p.industry || '').toLowerCase().includes(q);
      const matchLoc = (p.location || '').toLowerCase().includes(q);
      const matchExpertise = (p.expertise || []).some((ex) => ex.toLowerCase().includes(q));
      if (!matchCompany && !matchIndustry && !matchLoc && !matchExpertise) return false;
    }

    // Support Type
    if (selectedSupportType !== 'all') {
      const hasType = (p.supportTypes || []).includes(selectedSupportType);
      if (!hasType) return false;
    }

    // Status Tab Filter
    if (statusFilter === 'available' && p.status !== 'AVAILABLE') return false;
    if (statusFilter === 'pending' && p.status !== 'PENDING') return false;
    if (statusFilter === 'active' && !['ACCEPTED', 'ACTIVE'].includes(p.status)) return false;

    return true;
  });

  const pendingCount = partners.filter((p) => p.status === 'PENDING').length;
  const activeCount = partners.filter((p) => ['ACCEPTED', 'ACTIVE'].includes(p.status)).length;

  return (
    <div className="space-y-6 font-serif max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-gov-border rounded-xs p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gov-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-gov-sand-100 text-gov-maroon font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs border border-gov-border">
                INDUSTRY ECOSYSTEM
              </span>
              <span className="text-xs text-gov-text-muted flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified State Innovation Partners</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gov-navy tracking-tight">
              Industry & Corporate Innovation Partners
            </h1>
            <p className="text-xs text-gov-text-secondary leading-relaxed max-w-3xl">
              Connect with accredited public utilities, corporate CSR partners, and industrial labs offering engineering mentorship, testbed infrastructure, prototyping grants, and live municipal pilot validation.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="subtle"
              size="sm"
              onClick={fetchIndustryData}
              disabled={loading}
              icon={RefreshCw}
              className="text-gov-navy"
            >
              Refresh Directory
            </Button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 text-center text-xs">
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Accredited Partners</span>
            <span className="text-lg font-bold text-gov-navy mt-0.5 block">{partners.length}</span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Active Collaborations</span>
            <span className="text-lg font-bold text-emerald-800 mt-0.5 block">{activeCount}</span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Pending Outreach</span>
            <span className="text-lg font-bold text-amber-800 mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="p-3 bg-gov-sand-50 rounded-xs border border-gov-border">
            <span className="text-[10px] font-bold text-gov-text-muted uppercase block">Eligible Support Types</span>
            <span className="text-xs font-mono font-bold text-gov-navy mt-1 block">8 Modalities</span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card accent="none" className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, sector, expertise, or district..."
              className="w-full pl-9 pr-4 py-2 border border-gov-border rounded-xs text-xs font-sans focus:outline-hidden focus:border-gov-navy bg-gov-sand-50"
            />
          </div>

          {/* Support Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gov-text-muted font-bold whitespace-nowrap">Support Modality:</span>
            <select
              value={selectedSupportType}
              onChange={(e) => setSelectedSupportType(e.target.value)}
              className="px-3 py-2 border border-gov-border rounded-xs text-xs font-sans bg-white focus:outline-hidden focus:border-gov-navy"
            >
              {SUPPORT_TYPES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 border-t border-gov-border mt-3 pt-3 overflow-x-auto text-xs">
          <span className="text-[11px] text-gov-text-muted font-bold mr-2 uppercase tracking-wider">Status:</span>
          {[
            { id: 'all', label: `All Partners (${partners.length})` },
            { id: 'available', label: `Available for Outreach` },
            { id: 'pending', label: `Pending Requests (${pendingCount})` },
            { id: 'active', label: `Active / Accepted (${activeCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-xs font-medium text-xs transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-gov-navy text-white font-bold'
                  : 'text-gov-text-secondary hover:bg-gov-sand-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Security & Governance Notice */}
      <div className="p-3.5 bg-gov-sand-50 border border-gov-border rounded-xs flex items-start space-x-2.5 text-xs text-gov-text-secondary">
        <ShieldCheck className="w-4 h-4 text-gov-maroon shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-gov-navy block">Student Governance & Security Guardrails:</span>
          <span>
            Students can explore real industrial partners and initiate formal collaboration requests. Corporate profile records, grant commitments, and partnership status transitions (e.g. <strong>ACCEPTED</strong> / <strong>ACTIVE</strong>) are governed exclusively by authorized industry representatives and University Nodal Officers.
          </span>
        </div>
      </div>

      {/* Main Partners Listing */}
      {loading ? (
        <LoadingState message="Loading industry partners and collaboration status..." />
      ) : error ? (
        <ErrorState
          title="Error Loading Industry Partners"
          message={error}
          onRetry={fetchIndustryData}
          retryLabel="Retry Loading Directory"
        />
      ) : filteredPartners.length === 0 ? (
        <div className="bg-white border border-gov-border rounded-xs p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gov-sand-100 flex items-center justify-center mx-auto text-gov-maroon">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gov-navy">No industry partnerships yet.</h3>
            <p className="text-xs text-gov-text-secondary max-w-md mx-auto">
              {partners.length === 0
                ? 'No industry partners have been registered in the system yet. Once accredited corporate partners register, they will be listed here.'
                : 'No industry partners match your current filter parameters. Try adjusting search terms or clearing the support modality filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPartners.map((partner) => {
            const statusConfig = STATUS_BADGE_CONFIG[partner.status] || STATUS_BADGE_CONFIG.AVAILABLE;
            const isConnected = partner.status && partner.status !== 'AVAILABLE';
            const isPending = partner.status === 'PENDING';
            const isActive = ['ACCEPTED', 'ACTIVE'].includes(partner.status);

            return (
              <Card
                key={partner._id}
                accent={isActive ? 'maroon' : isPending ? 'gold' : 'navy'}
                className="flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3.5">
                  {/* Company Top Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-gov-border pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs bg-gov-sand-100 text-gov-navy border border-gov-border">
                          {partner.organizationType || 'Industry'}
                        </span>
                        <span className="text-[10px] text-gov-text-muted flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gov-maroon" />
                          <span>{partner.district || 'Delhi NCR'}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-gov-navy text-base mt-1 leading-snug">
                        {partner.company}
                      </h3>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-xs border shrink-0 ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Industry Sector & Location */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                        Industry Sector
                      </span>
                      <span className="font-semibold text-gov-navy block mt-0.5">
                        {partner.industry}
                      </span>
                    </div>

                    {partner.location && (
                      <p className="text-[11px] text-gov-text-secondary">
                        Facility: {partner.location}
                      </p>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {partner.expertise && partner.expertise.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                        Core Technical Expertise
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {partner.expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="bg-gov-sand-50 text-gov-navy border border-gov-border px-2 py-0.5 rounded-xs text-[11px] font-mono"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supported Support Types */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-gov-text-muted block">
                      Support Modalities
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {partner.supportTypes.map((st, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded-xs text-[10px] font-semibold"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industrial Mentors Info */}
                  {partner.mentorInfo && (
                    <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-gov-navy text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-gov-maroon" />
                        <span>
                          {partner.mentorInfo.availableMentorsCount || 'Multiple'} Industrial Mentors Available
                        </span>
                      </div>
                      {partner.mentorInfo.domains && partner.mentorInfo.domains.length > 0 && (
                        <p className="text-[11px] text-gov-text-secondary leading-tight">
                          Domains: {partner.mentorInfo.domains.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Active Partnership Snippet */}
                  {partner.partnership && (
                    <div className="p-2.5 bg-gov-sand-100 rounded-xs border border-gov-border text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gov-maroon block">
                        Linked Project Outreach
                      </span>
                      <div className="font-semibold text-gov-navy truncate">
                        {partner.partnership.projectTitle || 'Innovation Project'}
                      </div>
                      <div className="text-[11px] text-gov-text-muted flex justify-between">
                        <span>Requested: <strong>{partner.partnership.supportType}</strong></span>
                        <span className="font-mono">{new Date(partner.partnership.updatedAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gov-border mt-4 flex items-center justify-between gap-2 text-xs">
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gov-text-muted hover:text-gov-maroon text-[11px] flex items-center space-x-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center space-x-2 ml-auto">
                    {isActive && (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => setDetailsModalPartner(partner)}
                        className="text-xs font-bold text-gov-navy"
                      >
                        View Partnership
                      </Button>
                    )}

                    {isPending && (
                      <span className="text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded-xs border border-amber-300 font-semibold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Under Review</span>
                      </span>
                    )}

                    {!isPending && !isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenRequestModal(partner)}
                        icon={Send}
                        className="bg-gov-maroon text-white font-bold text-xs"
                      >
                        Request Collaboration
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Request Industry Collaboration */}
      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Handshake className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Initiate Industry Collaboration Outreach
                </h3>
              </div>
              <button
                onClick={handleCloseRequestModal}
                className="text-gray-400 hover:text-gov-navy transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRequest} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Partner Highlight */}
              <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Target Industry Partner</span>
                <div className="font-bold text-gov-navy text-sm">{selectedPartner.company}</div>
                <div className="text-[11px] text-gov-text-secondary">{selectedPartner.industry} &bull; {selectedPartner.district}</div>
              </div>

              {/* Target Project Selection */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Associated Project <span className="text-rose-600">*</span>
                </label>
                <select
                  value={requestForm.projectId}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, projectId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  {studentProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gov-text-muted mt-0.5 block">
                  Only projects where you are an enrolled team member appear here.
                </span>
              </div>

              {/* Requested Support Type */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Requested Support Modality <span className="text-rose-600">*</span>
                </label>
                <select
                  value={requestForm.requestedSupport}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, requestedSupport: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                >
                  <option value="MENTORSHIP">MENTORSHIP — Technical & Domain Advisement</option>
                  <option value="FUNDING">FUNDING — Prototyping & Equipment Grants</option>
                  <option value="TECHNOLOGY">TECHNOLOGY — Tooling, APIs & Software Licenses</option>
                  <option value="PROTOTYPING">PROTOTYPING — Industrial Lab & Machine Shop Access</option>
                  <option value="TESTING">TESTING — Specialized Calibration & Benchmarking</option>
                  <option value="PILOT">PILOT — Field Trial Site Deployment</option>
                  <option value="IMPLEMENTATION">IMPLEMENTATION — Zonal Scale-Up Support</option>
                  <option value="TECH_TRANSFER">TECH_TRANSFER — Commercialization & IP Licensing</option>
                </select>
              </div>

              {/* Reason for Outreach */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Rationale / Strategic Synergy <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explain why this partner's expertise or facilities are critical to your innovation project..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-gov-sand-50 text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Detailed Message / Outreach */}
              <div>
                <label className="block font-bold text-gov-navy mb-1 uppercase text-[10px] tracking-wider">
                  Formal Outreach Proposal Message <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={requestForm.message}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Detail the requested resources, testing schedule, expected deliverables, and timeline..."
                  required
                  className="w-full px-3 py-2 border border-gov-border rounded-xs bg-white text-xs font-sans focus:outline-hidden focus:border-gov-navy"
                />
              </div>

              {/* Governance & Self-Approval Guard Notice */}
              <div className="p-3 bg-gov-sand-50 border border-gov-border rounded-xs text-[11px] text-gov-text-secondary space-y-1">
                <span className="font-bold text-gov-navy block">Security & Authorization Notice:</span>
                <p>
                  Submitting this request sets its status to <strong>PENDING</strong> and alerts the corporate innovation officer. Students cannot self-approve or activate partnerships. Formal acceptance is granted exclusively through authorized industry and university workflows.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-gov-border flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={handleCloseRequestModal}
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
                  {submitting ? 'Submitting Outreach...' : 'Submit Collaboration Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Partnership Details */}
      {detailsModalPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-serif animate-in fade-in">
          <div className="bg-white border border-gov-border rounded-xs shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gov-border flex items-center justify-between bg-gov-sand-50">
              <div className="flex items-center space-x-2">
                <Handshake className="w-4 h-4 text-gov-maroon" />
                <h3 className="font-bold text-gov-navy text-sm">
                  Active Partnership Details
                </h3>
              </div>
              <button
                onClick={() => setDetailsModalPartner(null)}
                className="text-gray-400 hover:text-gov-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1 border-b border-gov-border pb-3">
                <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Corporate Partner</span>
                <h4 className="font-bold text-gov-navy text-base">{detailsModalPartner.company}</h4>
                <p className="text-gov-text-secondary text-[11px]">{detailsModalPartner.industry} &bull; {detailsModalPartner.district}</p>
              </div>

              {detailsModalPartner.partnership && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border">
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Support Type</span>
                      <span className="font-bold text-gov-navy text-xs mt-0.5 block">{detailsModalPartner.partnership.supportType}</span>
                    </div>
                    <div className="p-2.5 bg-gov-sand-50 rounded-xs border border-gov-border">
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Partnership Status</span>
                      <span className="font-bold text-emerald-800 text-xs mt-0.5 block">{detailsModalPartner.partnership.status}</span>
                    </div>
                  </div>

                  {detailsModalPartner.partnership.assignedMentor?.name && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-blue-900 block flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Designated Industrial Mentor</span>
                      </span>
                      <div className="font-bold text-gov-navy">{detailsModalPartner.partnership.assignedMentor.name}</div>
                      <div className="text-[11px] text-gov-text-secondary">
                        {detailsModalPartner.partnership.assignedMentor.designation || 'Senior Research Engineer'}
                      </div>
                      {detailsModalPartner.partnership.assignedMentor.email && (
                        <div className="text-[11px] text-gov-maroon font-mono">
                          {detailsModalPartner.partnership.assignedMentor.email}
                        </div>
                      )}
                    </div>
                  )}

                  {detailsModalPartner.partnership.reason && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Strategic Rationale</span>
                      <p className="text-gov-text-secondary mt-0.5">{detailsModalPartner.partnership.reason}</p>
                    </div>
                  )}

                  {detailsModalPartner.partnership.message && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gov-text-muted block">Outreach Proposal</span>
                      <p className="text-gov-text-secondary mt-0.5 italic bg-gov-sand-50 p-2 rounded-xs border border-gov-border">
                        "{detailsModalPartner.partnership.message}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-gov-border flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDetailsModalPartner(null)}
                  className="bg-gov-navy text-white text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentIndustryPage;
